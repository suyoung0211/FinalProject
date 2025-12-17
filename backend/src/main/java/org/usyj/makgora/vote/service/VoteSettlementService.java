package org.usyj.makgora.vote.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.user.entity.UserEntity;
import org.usyj.makgora.user.repository.UserRepository;
import org.usyj.makgora.vote.dto.voteDetailRequest.VoteDetailResolveRequest;
import org.usyj.makgora.vote.dto.voteDetailResponse.VoteDetailSettlementResponse;
import org.usyj.makgora.vote.entity.VoteEntity;
import org.usyj.makgora.vote.entity.VoteOptionChoiceEntity;
import org.usyj.makgora.vote.entity.VoteOptionEntity;
import org.usyj.makgora.vote.entity.VoteUserEntity;
import org.usyj.makgora.vote.repository.VoteOptionChoiceRepository;
import org.usyj.makgora.vote.repository.VoteOptionRepository;
import org.usyj.makgora.vote.repository.VoteRepository;
import org.usyj.makgora.vote.repository.VoteUserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VoteSettlementService {

    private final VoteRepository voteRepository;
    private final VoteOptionRepository optionRepository;
    private final VoteUserRepository voteUserRepository;
    private final UserRepository userRepository;
    private final VoteStatusHistoryService historyService;
    private final VoteOptionChoiceRepository choiceRepository;

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
    Integer choiceId = Math.toIntExact(ans.getChoiceId());

    VoteOptionChoiceEntity correctChoice =
            choiceRepository.findById(choiceId)
                    .orElseThrow(() -> new RuntimeException("Choice not found"));

    // 🔥 핵심 방어: 이 choice가 이 option 소속인지 확인
    if (!correctChoice.getOption().getId().equals(option.getId())) {
        throw new RuntimeException("Choice does not belong to option");
    }

    option.setCorrectChoice(correctChoice);
}

    vote.setStatus(VoteEntity.Status.RESOLVED);
    vote.setUpdatedAt(LocalDateTime.now());
    voteRepository.save(vote);
    historyService.recordStatus(vote, VoteEntity.Status.RESOLVED);

    // ⚠️ preview는 정산 로직 안 태움
    return VoteDetailSettlementResponse.builder()
            .voteId(vote.getId())
            .build();
}
    /* ============================================================
       1) 종료처리만(정답X) (FINISHED → RESOLVED)
       ============================================================ */

    @Transactional
public void finish(Integer voteId) {
    VoteEntity vote = voteRepository.findById(voteId)
        .orElseThrow();

    if (vote.getStatus() != VoteEntity.Status.ONGOING) {
        throw new RuntimeException("종료 불가 상태");
    }

    vote.setStatus(VoteEntity.Status.FINISHED);
    voteRepository.save(vote);
    historyService.recordStatus(vote, VoteEntity.Status.FINISHED);
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

        /* ===============================
           옵션 참여자 / 정답자
           =============================== */
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

        /* ===============================
           🔥 배당률 확정 (표시용)
           =============================== */
        Double odds = option.getOdds();

if (applyResult && (odds == null || odds <= 0)) {

    double rawOdds;

    if (winnerPool == 0) {
        rawOdds = 1.0;
    } else {
        rawOdds = (double) distributablePool / winnerPool;
    }

    odds = Math.min(
            MAX_ODDS,
            Math.max(1.0, round(rawOdds))
    );

    option.setOdds(odds);
    optionRepository.save(option);
}

        int distributedSum = 0;

        /* ===============================
           ✅ 실제 정산 (풀 기반 안전 분배)
           =============================== */
        if (applyResult && winnerPool > 0) {

            int remainingPool = distributablePool;

            for (int i = 0; i < winners.size(); i++) {
                VoteUserEntity vu = winners.get(i);
                int bet = vu.getPointsBet();

                int reward;
                if (i == winners.size() - 1) {
                    // 🔒 마지막 승자에게 잔여 몰아주기
                    reward = remainingPool;
                } else {
                    double ratio = (double) bet / winnerPool;
                    reward = (int) Math.floor(distributablePool * ratio);
                    remainingPool -= reward;
                }

                distributedSum += reward;

                UserEntity user = vu.getUser();
                user.setPoints(user.getPoints() + reward);
                user.setLevel(user.getLevel() == null ? 1 : user.getLevel() + 1);
                userRepository.save(user);

                vu.setRewardPoints(reward);
                vu.setUpdatedAt(LocalDateTime.now());
                voteUserRepository.save(vu);
            }

            // 패자 처리
            for (VoteUserEntity vu : optionBets) {
                if (!winners.contains(vu)) {
                    vu.setRewardPoints(0);
                    vu.setUpdatedAt(LocalDateTime.now());
                    voteUserRepository.save(vu);
                }
            }

            totalDistributed += distributedSum;
            totalWinnerCount += winners.size();
        }

        /* ===============================
           결과 DTO
           =============================== */
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

    /* ===============================
       투표 상태 마무리
       =============================== */
    if (applyResult) {
        vote.setRewarded(true);
        vote.setStatus(VoteEntity.Status.REWARDED);
        vote.setUpdatedAt(LocalDateTime.now());
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


    private double calculateFinalOdds(
        VoteOptionEntity option,
        List<VoteUserEntity> allBets,
        double feeRate
) {
    List<VoteUserEntity> optionBets =
            allBets.stream()
                    .filter(v -> v.getOption().getId().equals(option.getId()))
                    .filter(v -> !Boolean.TRUE.equals(v.getIsCancelled()))
                    .toList();

    List<VoteUserEntity> winners =
            optionBets.stream()
                    .filter(v -> v.getChoice().getId().equals(option.getCorrectChoice().getId()))
                    .toList();

    int optionPool = optionBets.stream()
            .mapToInt(v -> v.getPointsBet() == null ? 0 : v.getPointsBet())
            .sum();

    int winnerPool = winners.stream()
            .mapToInt(v -> v.getPointsBet() == null ? 0 : v.getPointsBet())
            .sum();

    if (winnerPool == 0) return 1.0;
    if (winnerPool == optionPool) return 1.0;

    int distributablePool =
            (int) Math.floor(optionPool * (1.0 - feeRate));

    double rawOdds = (double) distributablePool / winnerPool;

    return Math.min(
            MAX_ODDS,
            Math.max(1.0, round(rawOdds))
    );
}
}
