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


    /* ============================================================
       1) 정답 확정 + 미리보기
       ============================================================ */
    @Transactional
    public VoteDetailSettlementResponse resolve(Integer voteId, VoteDetailResolveRequest req) {

        VoteEntity vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("Vote not found"));

        if (vote.getStatus() != VoteEntity.Status.FINISHED) {
            throw new RuntimeException("FINISHED 상태에서만 정답 확정 가능합니다.");
        }

        // 단일 정답 모드
        if (req.getAnswers() == null || req.getAnswers().isEmpty()) {
            VoteOptionChoiceEntity correctChoice = choiceRepository
                    .findById(req.getCorrectChoiceId())
                    .orElseThrow(() -> new RuntimeException("Choice not found"));

            vote.setCorrectChoice(correctChoice);
            vote.setStatus(VoteEntity.Status.RESOLVED);
            vote.setUpdatedAt(LocalDateTime.now());

            return computePreview(vote, correctChoice);
        }

        // 옵션별 정답 모드
        vote.setStatus(VoteEntity.Status.RESOLVED);
        vote.setUpdatedAt(LocalDateTime.now());

        return computePreviewMultiple(vote, req);
    }


    /* ============================================================
       2) 정답 확정 + 즉시 정산
       ============================================================ */
    @Transactional
    public VoteDetailSettlementResponse resolveAndSettle(Integer voteId, VoteDetailResolveRequest req) {

        VoteEntity vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("Vote not found"));

        if (vote.getStatus() != VoteEntity.Status.FINISHED) {
            throw new RuntimeException("FINISHED 상태에서만 정답 확정 가능합니다.");
        }

        vote.setStatus(VoteEntity.Status.RESOLVED);
        vote.setUpdatedAt(LocalDateTime.now());

        // 단일 정답 모드
        if (req.getAnswers() == null || req.getAnswers().isEmpty()) {

            VoteOptionChoiceEntity correctChoice = choiceRepository
                    .findById(req.getCorrectChoiceId())
                    .orElseThrow(() -> new RuntimeException("Choice not found"));

            vote.setCorrectChoice(correctChoice);
            return settleSingle(vote, correctChoice);
        }

        // 옵션별 정답 모드
        return settleMultiple(vote, req);
    }

    /* ============================================================
   🔍 단일 정답 미리보기 계산
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
            .build();
}

        /* ============================================================
   🎯 API가 호출하는 단독 정산 함수 (RESOLVED → REWARDED)
   ============================================================ */
@Transactional
public VoteDetailSettlementResponse settle(Integer voteId) {

    VoteEntity vote = voteRepository.findById(voteId)
            .orElseThrow(() -> new RuntimeException("Vote not found"));

    if (vote.getStatus() != VoteEntity.Status.RESOLVED) {
        throw new RuntimeException("RESOLVED 상태에서만 정산 가능합니다.");
    }

    VoteOptionChoiceEntity correctChoice = vote.getCorrectChoice();
    if (correctChoice == null) {
        throw new RuntimeException("정답이 설정되지 않았습니다.");
    }

    return settleSingle(vote, correctChoice); // 🔥 단일 정산만 지원
}

    /* ============================================================
       3) 단일 정답 정산
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

        int winnerPool = correctChoice.getPointsTotal() == null
                ? 0 : correctChoice.getPointsTotal();

        double feeRate = vote.getFeeRate();

        /* 배당 계산 */
        for (VoteOptionChoiceEntity c : allChoices) {

            int pt = (c.getPointsTotal() == null ? 0 : c.getPointsTotal());

            if (pt <= 0 || totalPool <= 0) {
                c.setOdds(0.0);
                continue;
            }

            double odds = (1.0 - feeRate) / ((double) pt / totalPool);
            c.setOdds(odds);
        }
        choiceRepository.saveAll(allChoices);


        /* 유저 정산 */
        List<VoteUserEntity> winners =
                voteUserRepository.findByChoiceId(correctChoice.getId());

        int distributedSum = 0;
        double winnerOdds = correctChoice.getOdds();

        for (VoteUserEntity vu : winners) {
            int bet = vu.getPointsBet() == null ? 0 : vu.getPointsBet();
            int reward = (int) Math.floor(bet * winnerOdds);

            distributedSum += reward;

            UserEntity user = vu.getUser();
            user.setPoints(user.getPoints() + reward);
            userRepository.save(user);

            vu.setUpdatedAt(LocalDateTime.now());
        }

        vote.setStatus(VoteEntity.Status.REWARDED);
        voteRepository.save(vote);

        return VoteDetailSettlementResponse.builder()
                .voteId(vote.getId())
                .correctChoiceId(correctChoice.getId().intValue())
                .totalPool(totalPool)
                .winnerPool(winnerPool)
                .winnerOdds(winnerOdds)
                .winnerCount(winners.size())
                .distributedSum(distributedSum)
                .build();
    }


    /* ============================================================
       4) 옵션별 정답 정산 (YES/NO/DRAW 구조에서도 유연하게 대응)
       ============================================================ */
    private VoteDetailSettlementResponse settleMultiple(
            VoteEntity vote,
            VoteDetailResolveRequest req
    ) {

        StringBuilder summary = new StringBuilder();
        int totalDistributed = 0;
        int totalWinners = 0;

        for (VoteDetailResolveRequest.CorrectAnswer ans : req.getAnswers()) {

            VoteOptionEntity option = optionRepository.findById(ans.getOptionId())
                    .orElseThrow(() -> new RuntimeException("Option not found"));

            VoteOptionChoiceEntity correctChoice = choiceRepository.findById(ans.getChoiceId())
                    .orElseThrow(() -> new RuntimeException("Choice not found"));

            int optionPool = option.getChoices().stream()
                    .mapToInt(c -> c.getPointsTotal() == null ? 0 : c.getPointsTotal())
                    .sum();

            int winnerPool = correctChoice.getPointsTotal() == null
                    ? 0 : correctChoice.getPointsTotal();

            if (winnerPool == 0) {
                summary.append("Option ").append(option.getId()).append(": 승자 없음\n");
                continue;
            }

            double odds = (double) optionPool / winnerPool;

            List<VoteUserEntity> winners =
                    voteUserRepository.findByChoiceId(correctChoice.getId());

            totalWinners += winners.size();

            for (VoteUserEntity vu : winners) {
                int bet = vu.getPointsBet() == null ? 0 : vu.getPointsBet();
                int reward = (int) Math.floor(bet * odds);

                UserEntity user = vu.getUser();
                user.setPoints(user.getPoints() + reward);
                userRepository.save(user);

                totalDistributed += reward;
                vu.setUpdatedAt(LocalDateTime.now());
            }

            summary.append(
                    String.format("Option %d → 정답 %d / Odds %.2f / Winners %d\n",
                            option.getId(), correctChoice.getId(), odds, winners.size())
            );
        }

        vote.setStatus(VoteEntity.Status.REWARDED);
        voteRepository.save(vote);

        return VoteDetailSettlementResponse.builder()
                .voteId(vote.getId())
                .correctChoiceId(null)  // 옵션별 구조에서는 단일 정답 없음
                .winnerCount(totalWinners)
                .distributedSum(totalDistributed)
                .resultSummary(summary.toString())
                .build();
    }


    /* ============================================================
       5) 미리보기(옵션별)
       ============================================================ */
    private VoteDetailSettlementResponse computePreviewMultiple(
            VoteEntity vote,
            VoteDetailResolveRequest req
    ) {

        StringBuilder summary = new StringBuilder();

        for (VoteDetailResolveRequest.CorrectAnswer ans : req.getAnswers()) {

            VoteOptionEntity option = optionRepository.findById(ans.getOptionId())
                    .orElseThrow(() -> new RuntimeException("Option not found"));

            VoteOptionChoiceEntity correctChoice = choiceRepository.findById(ans.getChoiceId())
                    .orElseThrow(() -> new RuntimeException("Choice not found"));

            int optionPool = option.getChoices().stream()
                    .mapToInt(c -> c.getPointsTotal() == null ? 0 : c.getPointsTotal())
                    .sum();

            int winnerPool = correctChoice.getPointsTotal() == null
                    ? 0 : correctChoice.getPointsTotal();

            double odds =
                    (winnerPool == 0 ? 0 : (double) optionPool / winnerPool);

            summary.append(
                    String.format("Option %d → Preview Odds: %.2f\n",
                            option.getId(), odds)
            );
        }

        return VoteDetailSettlementResponse.builder()
                .voteId(vote.getId())
                .resultSummary(summary.toString())
                .build();
    }
}
