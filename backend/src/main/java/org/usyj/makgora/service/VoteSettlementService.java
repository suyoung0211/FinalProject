package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.*;
import org.usyj.makgora.repository.*;
import org.usyj.makgora.request.voteDetails.VoteDetailResolveRequest;
import org.usyj.makgora.response.voteDetails.VoteDetailSettlementResponse;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VoteSettlementService {

    private final VoteRepository voteRepository;
    private final VoteOptionRepository optionRepository;
    private final VoteOptionChoiceRepository choiceRepository;
    private final VoteUserRepository voteUserRepository;
    private final UserRepository userRepository;
    private final VoteStatusHistoryService historyService;

    /* ============================================================
       1) 정답 확정 (FINISHED → RESOLVED)
       - answers 기반으로 VoteOptionChoice.isCorrect 저장
       - Vote.correctChoice는 "대표 정답"으로 1개만 저장(호환/표시용)
       ============================================================ */
    @Transactional
    public VoteDetailSettlementResponse finished(Integer voteId, VoteDetailResolveRequest req) {

        VoteEntity vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("Vote not found"));

        // ONGOING이면 자동 FINISHED
        if (vote.getStatus() == VoteEntity.Status.ONGOING) {
            vote.setStatus(VoteEntity.Status.FINISHED);
        }

        if (vote.getStatus() != VoteEntity.Status.FINISHED) {
            throw new RuntimeException("정답 확정 불가한 상태입니다. 상태=" + vote.getStatus());
        }

        if (req.getAnswers() == null || req.getAnswers().isEmpty()) {
            throw new RuntimeException("옵션별 정답 정보(answers)가 필요합니다.");
        }

        // vote 전체 choice 정답 초기화
        List<VoteOptionChoiceEntity> allChoices = vote.getOptions().stream()
                .flatMap(o -> o.getChoices().stream())
                .toList();

        for (VoteOptionChoiceEntity c : allChoices) {
            c.setIsCorrect(false);
        }

        VoteOptionChoiceEntity representative = null;

        // answers 기반 option별 정답 세팅 + 검증
        for (VoteDetailResolveRequest.CorrectAnswer ans : req.getAnswers()) {

            VoteOptionEntity option = optionRepository.findById(ans.getOptionId())
                    .orElseThrow(() -> new RuntimeException("Option not found"));

            VoteOptionChoiceEntity choice = choiceRepository.findById(ans.getChoiceId())
                    .orElseThrow(() -> new RuntimeException("Choice not found"));

            // 검증: choice가 해당 option 소속인지
            if (!choice.getOption().getId().equals(option.getId())) {
                throw new RuntimeException("Choice가 Option에 속하지 않습니다. optionId="
                        + option.getId() + ", choiceId=" + choice.getId());
            }

            // 검증: option이 해당 vote 소속인지
            if (!option.getVote().getId().equals(vote.getId())) {
                throw new RuntimeException("Option이 Vote에 속하지 않습니다. voteId="
                        + vote.getId() + ", optionId=" + option.getId());
            }

            choice.setIsCorrect(true);

            if (representative == null) representative = choice;
        }

        // 대표 정답(호환/표시용)
        vote.setCorrectChoice(representative);
        vote.setStatus(VoteEntity.Status.RESOLVED);
        vote.setUpdatedAt(LocalDateTime.now());

        // 저장
        choiceRepository.saveAll(allChoices);
        voteRepository.save(vote);
        historyService.recordStatus(vote, VoteEntity.Status.RESOLVED);

        // Preview(옵션별 결과 구조로)
        return computePreviewMultiple(vote);
    }

    /* ============================================================
       REVIEWING → ONGOING (투표 오픈)
       ============================================================ */
    @Transactional
    public void openVote(Integer voteId) {
        VoteEntity vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("투표를 찾을 수 없습니다."));

        if (vote.getStatus() != VoteEntity.Status.REVIEWING) {
            throw new RuntimeException("REVIEWING 상태만 시작할 수 있습니다.");
        }

        vote.setStatus(VoteEntity.Status.ONGOING);
        voteRepository.save(vote);
        historyService.recordStatus(vote, VoteEntity.Status.ONGOING);
    }

    /* ============================================================
       2) 정답 확정 + 정산 동시에
       ============================================================ */
    @Transactional
    public VoteDetailSettlementResponse finishAndSettle(Integer voteId, VoteDetailResolveRequest req) {

        finished(voteId, req); // answers → DB isCorrect 저장

        VoteEntity vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("Vote not found"));

        return settleMultipleByDb(vote);
    }

    /* ============================================================
       3) 단독 정산 API (RESOLVED → REWARDED)
       ============================================================ */
    @Transactional
    public VoteDetailSettlementResponse settle(Integer voteId) {

        VoteEntity vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("Vote not found"));

        if (vote.getStatus() == VoteEntity.Status.FINISHED) {
            throw new RuntimeException("정답이 설정되지 않았습니다. 먼저 정답 확정 필요.");
        }

        if (vote.getStatus() != VoteEntity.Status.RESOLVED) {
            throw new RuntimeException("정산 불가한 상태입니다. 상태=" + vote.getStatus());
        }

        return settleMultipleByDb(vote);
    }

    /* ============================================================
       4) 옵션별 미리보기 (정산 전 요약)
       - 실제 지급은 안 하고 풀/정답/배당 "계산만" 보여줌
       ============================================================ */
    private VoteDetailSettlementResponse computePreviewMultiple(VoteEntity vote) {

        double feeRate = vote.getFeeRate() == null ? 0.0 : vote.getFeeRate();

        List<VoteDetailSettlementResponse.OptionSettlementResult> optionResults = new ArrayList<>();

        for (VoteOptionEntity option : vote.getOptions()) {

            List<VoteOptionChoiceEntity> choices = option.getChoices();

            VoteOptionChoiceEntity correct = choices.stream()
                    .filter(c -> Boolean.TRUE.equals(c.getIsCorrect()))
                    .findFirst()
                    .orElse(null);

            int optionPool = choices.stream()
                    .mapToInt(c -> c.getPointsTotal() == null ? 0 : c.getPointsTotal())
                    .sum();

            int winnerPool = (correct == null || correct.getPointsTotal() == null) ? 0 : correct.getPointsTotal();

            double odds = 0.0;
            if (optionPool > 0 && winnerPool > 0) {
                odds = ((double) optionPool / (double) winnerPool) * (1 - feeRate);
            }

            optionResults.add(
                    VoteDetailSettlementResponse.OptionSettlementResult.builder()
                            .optionId(option.getId())
                            .correctChoiceId(correct == null ? null : correct.getId())
                            .odds(odds)
                            .optionPool(optionPool)
                            .winnerPool(winnerPool)
                            .winnerCount(0)      // preview는 지급 전이므로 0
                            .distributedSum(0)   // preview는 지급 전이므로 0
                            .build()
            );
        }

        return VoteDetailSettlementResponse.builder()
                .voteId(vote.getId())
                .totalDistributed(0)
                .totalWinnerCount(0)
                .options(optionResults)
                .build();
    }

    /* ============================================================
       5) 옵션별 정산 (DB isCorrect 기반)
       - option 단위 pool로 odds 계산
       - option의 정답 choice 베팅자에게만 지급
       ============================================================ */
    private VoteDetailSettlementResponse settleMultipleByDb(VoteEntity vote) {

        double feeRate = vote.getFeeRate() == null ? 0.0 : vote.getFeeRate();

        int totalDistributed = 0;
        int totalWinnerCount = 0;

        List<VoteDetailSettlementResponse.OptionSettlementResult> optionResults = new ArrayList<>();

        for (VoteOptionEntity option : vote.getOptions()) {

            List<VoteOptionChoiceEntity> choices = option.getChoices();

            VoteOptionChoiceEntity correct = choices.stream()
                    .filter(c -> Boolean.TRUE.equals(c.getIsCorrect()))
                    .findFirst()
                    .orElse(null);

            if (correct == null) {
                // 정답 미지정 옵션은 스킵(혹은 결과에 0으로 포함)
                optionResults.add(
                        VoteDetailSettlementResponse.OptionSettlementResult.builder()
                                .optionId(option.getId())
                                .correctChoiceId(null)
                                .odds(0.0)
                                .optionPool(0)
                                .winnerPool(0)
                                .winnerCount(0)
                                .distributedSum(0)
                                .build()
                );
                continue;
            }

            int optionPool = choices.stream()
                    .mapToInt(c -> c.getPointsTotal() == null ? 0 : c.getPointsTotal())
                    .sum();

            int winnerPool = correct.getPointsTotal() == null ? 0 : correct.getPointsTotal();

            double odds = 0.0;
            if (optionPool > 0 && winnerPool > 0) {
                odds = ((double) optionPool / (double) winnerPool) * (1 - feeRate);
            }

            correct.setOdds(odds);

            // 정답 선택자만 정산 (취소 제외)
            List<VoteUserEntity> winners = voteUserRepository.findByChoiceId(correct.getId()).stream()
                    .filter(vu -> !Boolean.TRUE.equals(vu.getIsCancelled()))
                    .toList();

            int distributedSum = 0;

            if (odds > 0) {
                for (VoteUserEntity vu : winners) {

                    int bet = vu.getPointsBet() == null ? 0 : vu.getPointsBet();
                    int reward = (int) Math.floor(bet * odds);

                    UserEntity user = vu.getUser();
                    user.setPoints(user.getPoints() + reward);

                    if (user.getLevel() == null) user.setLevel(1);
                    user.setLevel(user.getLevel() + 1);

                    userRepository.save(user);

                    vu.setUpdatedAt(LocalDateTime.now());

                    distributedSum += reward;
                }
            }

            totalDistributed += distributedSum;
            totalWinnerCount += winners.size();

            optionResults.add(
                    VoteDetailSettlementResponse.OptionSettlementResult.builder()
                            .optionId(option.getId())
                            .correctChoiceId(correct.getId())
                            .odds(odds)
                            .optionPool(optionPool)
                            .winnerPool(winnerPool)
                            .winnerCount(winners.size())
                            .distributedSum(distributedSum)
                            .build()
            );
        }

        // odds 저장
        List<VoteOptionChoiceEntity> all = vote.getOptions().stream()
                .flatMap(o -> o.getChoices().stream())
                .toList();
        choiceRepository.saveAll(all);

        // vote 상태 갱신
        vote.setRewarded(true);
        vote.setStatus(VoteEntity.Status.REWARDED);
        voteRepository.save(vote);
        historyService.recordStatus(vote, VoteEntity.Status.REWARDED);

        return VoteDetailSettlementResponse.builder()
                .voteId(vote.getId())
                .totalDistributed(totalDistributed)
                .totalWinnerCount(totalWinnerCount)
                .options(optionResults)
                .build();
    }

    /* ============================================================
       6) 상태 강제 변경 (ONGOING → FINISHED)
       ============================================================ */
    @Transactional
    public void changeStatusToFinished(Integer voteId, Integer adminUserId) {

        VoteEntity vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("투표를 찾을 수 없습니다."));

        if (vote.getStatus() != VoteEntity.Status.ONGOING) {
            throw new RuntimeException("ONGOING 상태에서만 FINISHED로 변경할 수 있습니다.");
        }

        vote.setStatus(VoteEntity.Status.FINISHED);
        historyService.recordStatus(vote, VoteEntity.Status.FINISHED);
    }
}
