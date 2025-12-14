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
    private final VoteUserRepository voteUserRepository;
    private final UserRepository userRepository;
    private final VoteStatusHistoryService historyService;

    /* ============================================================
       1) 정답 확정 (FINISHED → RESOLVED)
       - option.correctChoice 저장
       ============================================================ */
    @Transactional
    public VoteDetailSettlementResponse finished(Integer voteId, VoteDetailResolveRequest req) {

        VoteEntity vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("Vote not found"));

        if (vote.getStatus() == VoteEntity.Status.ONGOING) {
            vote.setStatus(VoteEntity.Status.FINISHED);
        }

        if (vote.getStatus() != VoteEntity.Status.FINISHED) {
            throw new RuntimeException("정답 확정 불가한 상태입니다.");
        }

        if (req.getAnswers() == null || req.getAnswers().isEmpty()) {
            throw new RuntimeException("옵션별 정답 정보가 필요합니다.");
        }

        for (VoteDetailResolveRequest.CorrectAnswer ans : req.getAnswers()) {

            VoteOptionEntity option = optionRepository.findById(ans.getOptionId())
                    .orElseThrow(() -> new RuntimeException("Option not found"));

            if (!option.getVote().getId().equals(vote.getId())) {
                throw new RuntimeException("Option이 Vote에 속하지 않습니다.");
            }

            VoteOptionChoiceEntity correctChoice =
                    option.getChoices().stream()
                            .filter(c -> c.getId().equals(ans.getChoiceId()))
                            .findFirst()
                            .orElseThrow(() -> new RuntimeException("Choice not found in option"));

            option.setCorrectChoice(correctChoice);
        }

        vote.setStatus(VoteEntity.Status.RESOLVED);
        vote.setUpdatedAt(LocalDateTime.now());

        voteRepository.save(vote);
        historyService.recordStatus(vote, VoteEntity.Status.RESOLVED);

        return computePreviewMultiple(vote);
    }

    /* ============================================================
       2) 정답 확정 + 정산
       ============================================================ */
    @Transactional
    public VoteDetailSettlementResponse finishAndSettle(Integer voteId, VoteDetailResolveRequest req) {
        finished(voteId, req);
        return settleMultipleByDb(
                voteRepository.findById(voteId).orElseThrow()
        );
    }

    /* ============================================================
       3) 단독 정산
       ============================================================ */
    @Transactional
    public VoteDetailSettlementResponse settle(Integer voteId) {

        VoteEntity vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("Vote not found"));

        if (vote.getStatus() != VoteEntity.Status.RESOLVED) {
            throw new RuntimeException("정산 불가한 상태입니다.");
        }

        return settleMultipleByDb(vote);
    }

    /* ============================================================
       4) 옵션별 미리보기
       ============================================================ */
    private VoteDetailSettlementResponse computePreviewMultiple(VoteEntity vote) {

        double feeRate = vote.getFeeRate() == null ? 0.0 : vote.getFeeRate();
        List<VoteDetailSettlementResponse.OptionSettlementResult> results = new ArrayList<>();

        List<VoteUserEntity> allBets =
                voteUserRepository.findByVoteId(vote.getId());

        for (VoteOptionEntity option : vote.getOptions()) {

            VoteOptionChoiceEntity correct = option.getCorrectChoice();
            if (correct == null) continue;

            List<VoteUserEntity> optionBets =
                    allBets.stream()
                            .filter(v -> v.getOption().getId().equals(option.getId()))
                            .toList();

            int optionPool = optionBets.stream()
                    .mapToInt(v -> v.getPointsBet() == null ? 0 : v.getPointsBet())
                    .sum();

            int winnerPool = optionBets.stream()
                    .filter(v -> v.getChoice().getId().equals(correct.getId()))
                    .mapToInt(v -> v.getPointsBet() == null ? 0 : v.getPointsBet())
                    .sum();

            double odds = (optionPool > 0 && winnerPool > 0)
                    ? ((double) optionPool / winnerPool) * (1 - feeRate)
                    : 0.0;

            results.add(
                    VoteDetailSettlementResponse.OptionSettlementResult.builder()
                            .optionId(option.getId())
                            .correctChoiceId(correct.getId())
                            .odds(odds)
                            .optionPool(optionPool)
                            .winnerPool(winnerPool)
                            .winnerCount(0)
                            .distributedSum(0)
                            .build()
            );
        }

        return VoteDetailSettlementResponse.builder()
                .voteId(vote.getId())
                .totalDistributed(0)
                .totalWinnerCount(0)
                .options(results)
                .build();
    }

    /* ============================================================
       5) 실제 정산
       ============================================================ */
    /* ============================================================
   5) 실제 정산 (옵션 기준)
   ============================================================ */
private VoteDetailSettlementResponse settleMultipleByDb(VoteEntity vote) {

    double feeRate = vote.getFeeRate() == null ? 0.0 : vote.getFeeRate();

    int totalDistributed = 0;
    int totalWinnerCount = 0;

    List<VoteDetailSettlementResponse.OptionSettlementResult> results = new ArrayList<>();

    // 🔥 전체 베팅 한 번만 조회
    List<VoteUserEntity> allBets =
            voteUserRepository.findByVoteId(vote.getId());

    for (VoteOptionEntity option : vote.getOptions()) {

        VoteOptionChoiceEntity correct = option.getCorrectChoice();
        if (correct == null) continue;

        // 옵션별 유효 베팅
        List<VoteUserEntity> optionBets =
                allBets.stream()
                        .filter(v -> v.getOption().getId().equals(option.getId()))
                        .filter(v -> !Boolean.TRUE.equals(v.getIsCancelled()))
                        .toList();

        // 정답 베팅자
        List<VoteUserEntity> winners =
                optionBets.stream()
                        .filter(v -> v.getChoice().getId().equals(correct.getId()))
                        .toList();

        int optionPool = optionBets.stream()
                .mapToInt(v -> v.getPointsBet() == null ? 0 : v.getPointsBet())
                .sum();

        int winnerPool = winners.stream()
                .mapToInt(v -> v.getPointsBet() == null ? 0 : v.getPointsBet())
                .sum();

        double odds =
                (optionPool > 0 && winnerPool > 0)
                        ? ((double) optionPool / winnerPool) * (1 - feeRate)
                        : 0.0;

        // 🔥 옵션에 최종 odds 저장 (중요)
        option.setOdds(odds);
        optionRepository.save(option);

        int distributedSum = 0;

        for (VoteUserEntity vu : winners) {

            int bet = vu.getPointsBet() == null ? 0 : vu.getPointsBet();
            int reward = (int) Math.floor(bet * odds);

            UserEntity user = vu.getUser();

            // 포인트 지급
            user.setPoints(user.getPoints() + reward);

            // 레벨 증가 (null-safe)
            if (user.getLevel() == null) {
                user.setLevel(1);
            } else {
                user.setLevel(user.getLevel() + 1);
            }

            userRepository.save(user);

            // 정산 시점 기록
            vu.setUpdatedAt(LocalDateTime.now());
            distributedSum += reward;
        }

        totalDistributed += distributedSum;
        totalWinnerCount += winners.size();

        results.add(
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

    // 🔥 vote 상태 마무리
    vote.setRewarded(true);
    vote.setStatus(VoteEntity.Status.REWARDED);
    voteRepository.save(vote);
    historyService.recordStatus(vote, VoteEntity.Status.REWARDED);

    return VoteDetailSettlementResponse.builder()
            .voteId(vote.getId())
            .totalDistributed(totalDistributed)
            .totalWinnerCount(totalWinnerCount)
            .options(results)
            .build();
}


    /* ============================================================
   REVIEWING → ONGOING (투표 오픈)
   ============================================================ */
@Transactional
public void openVote(Integer voteId) {

    VoteEntity vote = voteRepository.findById(voteId)
            .orElseThrow(() -> new RuntimeException("투표를 찾을 수 없습니다."));

    if (vote.getStatus() != VoteEntity.Status.REVIEWING) {
        throw new RuntimeException("REVIEWING 상태에서만 투표를 시작할 수 있습니다.");
    }

    vote.setStatus(VoteEntity.Status.ONGOING);
    vote.setUpdatedAt(LocalDateTime.now());

    voteRepository.save(vote);
    historyService.recordStatus(vote, VoteEntity.Status.ONGOING);
}
}
