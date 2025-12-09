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
       1) 정답 확정 (FINISHED → RESOLVED)
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
            throw new RuntimeException("정답 정보가 없습니다. correctChoiceId 또는 answers 필요.");
        }

        // 대표 정답 1개 저장
        VoteDetailResolveRequest.CorrectAnswer first = req.getAnswers().get(0);

        VoteOptionChoiceEntity correct = choiceRepository.findById(first.getChoiceId())
                .orElseThrow(() -> new RuntimeException("Choice not found"));

        vote.setCorrectChoice(correct);
        vote.setStatus(VoteEntity.Status.RESOLVED);
        vote.setUpdatedAt(LocalDateTime.now());

        return computePreview(vote, correct);
    }


    /* ============================================================
       2) 정답 확정 + 정산 동시에
       ============================================================ */
    @Transactional
    public VoteDetailSettlementResponse resolveAndSettle(Integer voteId, VoteDetailResolveRequest req) {

        VoteDetailSettlementResponse preview = resolve(voteId, req); // 먼저 대표 정답 저장

        VoteEntity vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("Vote not found"));

        // 옵션별 정산
        return settleMultiple(vote, req);
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

        if (vote.getStatus() != VoteEntity.Status.RESOLVED) {
            throw new RuntimeException("RESOLVED 상태에서만 정산 가능합니다.");
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
        double feeRate = vote.getFeeRate();
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
                .winnerOdds(correctChoice.getOdds())
                .winnerCount(winners.size())
                .distributedSum(distributedSum)
                .resultSummary("단일 정답 정산 완료")
                .build();
    }


    /* ============================================================
       6) 옵션별 정산 (YES/NO/DRAW 전부 지원)
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
}
