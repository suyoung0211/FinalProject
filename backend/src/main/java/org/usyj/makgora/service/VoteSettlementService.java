package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.*;
import org.usyj.makgora.repository.*;
import org.usyj.makgora.request.voteDetails.VoteDetailResolveRequest;
import org.usyj.makgora.response.voteDetails.VoteDetailSettlementResponse;

import java.time.LocalDateTime;
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
    private final VotesStatusHistoryRepository historyRepository;

    /* ============================================================
       1) 정답 확정 (FINISHED → RESOLVED)
       ============================================================ */
    @Transactional
    public VoteDetailSettlementResponse finished(Integer voteId, VoteDetailResolveRequest req) {

        VoteEntity vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("Vote not found"));

        // 🔥 ONGOING이면 자동으로 FINISHED로 변경
        if (vote.getStatus() == VoteEntity.Status.ONGOING) {
            vote.setStatus(VoteEntity.Status.FINISHED);
        }

        // FINISHED 상태만 정답 확정 가능
        if (vote.getStatus() != VoteEntity.Status.FINISHED) {
            throw new RuntimeException("정답 확정 불가한 상태입니다. 상태=" + vote.getStatus());
        }

        // 🔥 단일 정답 모드: correctChoiceId 우선 사용
        VoteOptionChoiceEntity correct;

        if (req.getCorrectChoiceId() != null) {
            correct = choiceRepository.findById(req.getCorrectChoiceId())
                    .orElseThrow(() -> new RuntimeException("Choice not found"));
        } else if (req.getAnswers() != null && !req.getAnswers().isEmpty()) {
            // (옵션별 모드 고려해서 첫 번째를 대표 정답으로 사용)
            VoteDetailResolveRequest.CorrectAnswer first = req.getAnswers().get(0);
            correct = choiceRepository.findById(first.getChoiceId())
                    .orElseThrow(() -> new RuntimeException("Choice not found"));
        } else {
            throw new RuntimeException("정답 정보가 없습니다. correctChoiceId 또는 answers 필요.");
        }

        vote.setCorrectChoice(correct);
        vote.setStatus(VoteEntity.Status.RESOLVED);
        vote.setUpdatedAt(LocalDateTime.now());

        historyService.recordStatus(vote, VoteEntity.Status.RESOLVED);

        return computePreview(vote, correct);
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

        // 🔥 1단계: 정답 확정 (ONGOING → FINISHED → RESOLVED)
        VoteDetailSettlementResponse preview = finished(voteId, req);

        // 🔥 2단계: DB에서 최신 Vote + CorrectChoice 읽기
        VoteEntity vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("Vote not found"));

        VoteOptionChoiceEntity correct = vote.getCorrectChoice();
        if (correct == null) {
            throw new RuntimeException("정답이 설정되지 않았습니다.");
        }

        // 🔥 3단계: 실제 정산
        return settleSingle(vote, correct);
    }

    /* ============================================================
       3) 미리보기 (단일 정답)
       ============================================================ */
    private VoteDetailSettlementResponse computePreview(
            VoteEntity vote,
            VoteOptionChoiceEntity correctChoice
    ) {

        int totalPool = vote.getOptions().stream()
                .flatMap(o -> o.getChoices().stream())
                .mapToInt(c -> c.getPointsTotal() == null ? 0 : c.getPointsTotal())
                .sum();

        int winnerPool = correctChoice.getPointsTotal() == null
                ? 0 : correctChoice.getPointsTotal();

        return VoteDetailSettlementResponse.builder()
                .voteId(vote.getId())
                .correctChoiceId(correctChoice.getId().intValue())
                .totalPool(totalPool)
                .winnerPool(winnerPool)
                .resultSummary("미리보기: 단일 정답 = " + correctChoice.getId())
                .build();
    }

    /* ============================================================
       4) 단독 정산 API (RESOLVED → REWARDED)
       ============================================================ */
    @Transactional
    public VoteDetailSettlementResponse settle(Integer voteId) {

        VoteEntity vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("Vote not found"));

        // FINISHED 상태면 아직 정답이 안 정해진 것
        if (vote.getStatus() == VoteEntity.Status.FINISHED) {
            throw new RuntimeException("정답이 설정되지 않았습니다. 먼저 정답 확정 필요.");
        }

        if (vote.getStatus() != VoteEntity.Status.RESOLVED) {
            throw new RuntimeException("정산 불가한 상태입니다. 상태=" + vote.getStatus());
        }

        VoteOptionChoiceEntity correct = vote.getCorrectChoice();
        if (correct == null) {
            throw new RuntimeException("정답이 설정되지 않았습니다.");
        }

        return settleSingle(vote, correct);
    }

    /* ============================================================
       5) 단일 정답 정산
       ============================================================ */
    private VoteDetailSettlementResponse settleSingle(
            VoteEntity vote,
            VoteOptionChoiceEntity correctChoice
    ) {

        List<VoteOptionChoiceEntity> allChoices = vote.getOptions().stream()
                .flatMap(o -> o.getChoices().stream())
                .toList();

        int totalPool = allChoices.stream()
                .mapToInt(c -> c.getPointsTotal() == null ? 0 : c.getPointsTotal())
                .sum();

        int winnerPool = correctChoice.getPointsTotal() == null ? 0 : correctChoice.getPointsTotal();

        // 배당 계산
        double feeRate = vote.getFeeRate() == null ? 0.0 : vote.getFeeRate();

        for (VoteOptionChoiceEntity c : allChoices) {

            int pt = c.getPointsTotal() == null ? 0 : c.getPointsTotal();
            if (pt <= 0 || totalPool <= 0) {
                c.setOdds(0.0);
                continue;
            }

            double odds = (1 - feeRate) / ((double) pt / totalPool);
            c.setOdds(odds);
        }
        choiceRepository.saveAll(allChoices);

        // 유저 정산
        List<VoteUserEntity> winners = voteUserRepository.findByChoiceId(correctChoice.getId());

        int distributedSum = 0;
        for (VoteUserEntity vu : winners) {

            int bet = vu.getPointsBet() == null ? 0 : vu.getPointsBet();
            int reward = (int) Math.floor(bet * correctChoice.getOdds());

            distributedSum += reward;

            UserEntity user = vu.getUser();
            user.setPoints(user.getPoints() + reward);

            if (user.getLevel() == null) user.setLevel(1);
            user.setLevel(user.getLevel() + 1);
            userRepository.save(user);

            vu.setUpdatedAt(LocalDateTime.now());
        }

        vote.setStatus(VoteEntity.Status.REWARDED);
        voteRepository.save(vote);
        historyService.recordStatus(vote, VoteEntity.Status.REWARDED);

        return VoteDetailSettlementResponse.builder()
                .voteId(vote.getId())
                .correctChoiceId(correctChoice.getId().intValue())
                .totalPool(totalPool)
                .winnerPool(winnerPool)
                .winnerOdds(correctChoice.getOdds())
                .winnerCount(winners.size())
                .distributedSum(distributedSum)
                .resultSummary("단일 정답 정산 완료")
                .build();
    }

    /* ============================================================
       6) 옵션별 정산 (YES/NO/DRAW 전부 지원) — 지금은 사용 X
       ============================================================ */
    private VoteDetailSettlementResponse settleMultiple(
            VoteEntity vote,
            VoteDetailResolveRequest req
    ) {

        StringBuilder summary = new StringBuilder();
        int distributed = 0;
        int winnerCount = 0;

        for (VoteDetailResolveRequest.CorrectAnswer ans : req.getAnswers()) {

            VoteOptionEntity option = optionRepository.findById(ans.getOptionId())
                    .orElseThrow(() -> new RuntimeException("Option not found"));

            VoteOptionChoiceEntity correct = choiceRepository.findById(ans.getChoiceId())
                    .orElseThrow(() -> new RuntimeException("Choice not found"));

            int optionPool = option.getChoices().stream()
                    .mapToInt(c -> c.getPointsTotal() == null ? 0 : c.getPointsTotal())
                    .sum();

            int winnerPool = correct.getPointsTotal() == null ? 0 : correct.getPointsTotal();
            double odds = (winnerPool == 0 ? 0 : (double) optionPool / winnerPool);

            List<VoteUserEntity> winners = voteUserRepository.findByChoiceId(correct.getId());
            winnerCount += winners.size();

            for (VoteUserEntity vu : winners) {
                int reward = (int) Math.floor((vu.getPointsBet() == null ? 0 : vu.getPointsBet()) * odds);
                vu.getUser().setPoints(vu.getUser().getPoints() + reward);
                vu.getUser().setLevel(vu.getUser().getLevel() + 1);
                userRepository.save(vu.getUser());
                distributed += reward;
            }

            summary.append(
                    String.format("Option %d → Choice %d / Odds %.2f / Winners %d\n",
                            option.getId(), correct.getId(), odds, winners.size())
            );
        }

        vote.setStatus(VoteEntity.Status.REWARDED);
        voteRepository.save(vote);

        return VoteDetailSettlementResponse.builder()
                .voteId(vote.getId())
                .winnerCount(winnerCount)
                .distributedSum(distributed)
                .resultSummary(summary.toString())
                .build();
    }

    /* ============================================================
       7) 상태 강제 변경 (ONGOING → FINISHED)
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
