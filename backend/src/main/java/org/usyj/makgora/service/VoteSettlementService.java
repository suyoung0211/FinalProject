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

    private static final double MAX_ODDS = 10.0;

    /* ============================================================
       1) 정답 확정 (FINISHED → RESOLVED)
       ============================================================ */
    @Transactional
    public VoteDetailSettlementResponse finished(
            Integer voteId,
            VoteDetailResolveRequest req
    ) {
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
                            .orElseThrow(() -> new RuntimeException("Choice not found"));

            option.setCorrectChoice(correctChoice);
            optionRepository.save(option);
        }

        vote.setStatus(VoteEntity.Status.RESOLVED);
        vote.setUpdatedAt(LocalDateTime.now());
        voteRepository.save(vote);
        historyService.recordStatus(vote, VoteEntity.Status.RESOLVED);

        return previewSettlement(vote);
    }

    /* ============================================================
       2) 정답 확정 + 즉시 정산
       ============================================================ */
    @Transactional
    public VoteDetailSettlementResponse finishAndSettle(
            Integer voteId,
            VoteDetailResolveRequest req
    ) {
        finished(voteId, req);
        return settle(voteId);
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

        return executeSettlement(vote, true);
    }

    /* ============================================================
       4) 정산 미리보기 (DB 반영 없음)
       ============================================================ */
    private VoteDetailSettlementResponse previewSettlement(VoteEntity vote) {
        return executeSettlement(vote, false);
    }

    /* ============================================================
       5) 정산 공통 로직 (preview / execute)
       ============================================================ */
    private VoteDetailSettlementResponse executeSettlement(
            VoteEntity vote,
            boolean applyResult
    ) {
        double feeRate = vote.getFeeRate() != null ? vote.getFeeRate() : 0.0;

        List<VoteUserEntity> allBets =
                voteUserRepository.findByVoteId(vote.getId());

        int totalDistributed = 0;
        int totalWinnerCount = 0;

        List<VoteDetailSettlementResponse.OptionSettlementResult> results =
                new ArrayList<>();

        for (VoteOptionEntity option : vote.getOptions()) {

            VoteOptionChoiceEntity correct = option.getCorrectChoice();
            if (correct == null) continue;

            List<VoteUserEntity> optionBets =
                    allBets.stream()
                            .filter(v -> v.getOption().getId().equals(option.getId()))
                            .filter(v -> !Boolean.TRUE.equals(v.getIsCancelled()))
                            .toList();

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

            int distributablePool =
                    (int) Math.floor(optionPool * (1.0 - feeRate));

            double rawOdds;

if (winnerPool == 0) {
    rawOdds = 0.0;
} else if (winnerPool == optionPool) {
    // 🔒 전원 정답 → 원금 반환
    rawOdds = 1.0;
} else {
    rawOdds = (double) distributablePool / winnerPool;
}

// 🔥 배당률 하한선 보장
double odds = Math.min(
    MAX_ODDS,
    Math.max(1.0, round(rawOdds))
);

            int distributedSum = 0;

            if (applyResult && winnerPool > 0) {

                // 🔥 FINAL 배당률 스냅샷
                option.setOdds(odds);
                optionRepository.save(option);

                for (VoteUserEntity vu : winners) {

                    int bet = vu.getPointsBet();
                    int reward = (int) Math.floor(bet * odds);

                    distributedSum += reward;

                    UserEntity user = vu.getUser();
                    user.setPoints(user.getPoints() + reward);
                    user.setLevel(user.getLevel() == null ? 1 : user.getLevel() + 1);
                    userRepository.save(user);

                    vu.setRewardPoints(reward);
                    vu.setUpdatedAt(LocalDateTime.now());
                    voteUserRepository.save(vu);
                }

                // 패자 기록
                for (VoteUserEntity vu : optionBets) {
                    if (!winners.contains(vu)) {
                        vu.setRewardPoints(0);
                        voteUserRepository.save(vu);
                    }
                }

                // 🔒 안전장치
                if (distributedSum > distributablePool) {
                    throw new IllegalStateException("정산 분배 초과 발생");
                }

                totalDistributed += distributedSum;
                totalWinnerCount += winners.size();
            }

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

        if (applyResult) {
            vote.setRewarded(true);
            vote.setStatus(VoteEntity.Status.REWARDED);
            voteRepository.save(vote);
            historyService.recordStatus(vote, VoteEntity.Status.REWARDED);
        }

        return VoteDetailSettlementResponse.builder()
                .voteId(vote.getId())
                .totalDistributed(totalDistributed)
                .totalWinnerCount(totalWinnerCount)
                .options(results)
                .build();
    }

    /* ============================================================
       REVIEWING → ONGOING
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

    private double round(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
