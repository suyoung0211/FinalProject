package org.usyj.makgora.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.VoteEntity;
import org.usyj.makgora.entity.VoteOptionChoiceEntity;
import org.usyj.makgora.entity.VoteOptionEntity;
import org.usyj.makgora.entity.VoteUserEntity;
import org.usyj.makgora.repository.VoteOptionChoiceRepository;
import org.usyj.makgora.repository.VoteRepository;
import org.usyj.makgora.repository.VoteUserRepository;
import org.usyj.makgora.request.voteDetails.VoteDetailResolveRequest;
import org.usyj.makgora.response.voteDetails.VoteDetailSettlementResponse;

import lombok.RequiredArgsConstructor;

/**
 * 🎯 VoteSettlementService
 * - AI Vote 배당/정산 로직 전담 서비스
 * - 상태: FINISHED -> RESOLVED -> REWARDED
 */
@Service
@RequiredArgsConstructor
public class VoteSettlementService {

    private final VoteRepository voteRepository;
    private final VoteOptionChoiceRepository choiceRepository;
    private final VoteUserRepository voteUserRepository;

    /**
     * ✅ 1) 어드민이 정답 choice 를 선택 + 정산까지 한 번에 수행
     */
    @Transactional
    public org.usyj.makgora.response.voteDetails.VoteDetailSettlementResponse resolveAndSettle(Integer voteId,
                                                         VoteDetailResolveRequest request) {

        // 1) 투표 조회
        VoteEntity vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("Vote not found"));

        // 2) 정답 choice 조회
        VoteOptionChoiceEntity correctChoice = choiceRepository.findById(request.getCorrectChoiceId())
                .orElseThrow(() -> new RuntimeException("Choice not found"));

        // 방어: choice 가 해당 vote 에 속하는지 확인
        boolean belongsToVote = vote.getOptions().stream()
                .flatMap(o -> o.getChoices().stream())
                .anyMatch(c -> c.getId().equals(correctChoice.getId()));

        if (!belongsToVote) {
            throw new IllegalArgumentException("Choice does not belong to this vote");
        }

        // 3) Vote 에 정답 저장 + 상태 업데이트
        vote.setCorrectChoice(correctChoice);
        vote.setStatus(VoteEntity.Status.RESOLVED);
        vote.setUpdatedAt(LocalDateTime.now());

        // 4) 실제 정산 수행
        VoteDetailSettlementResponse result = settleInternal(vote, correctChoice);

        // 5) 최종 상태 REWARDED 로 변경
        vote.setStatus(VoteEntity.Status.REWARDED);
        vote.setRewarded(true);
        vote.setUpdatedAt(LocalDateTime.now());

        return result;
    }

    /**
     * ✅ 2) 이미 correctChoice 가 설정된 투표를 재정산(혹은 분리 호출) 하고 싶을 때 사용
     */
    @Transactional
    public VoteDetailSettlementResponse settle(Integer voteId) {

        VoteEntity vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("Vote not found"));

        VoteOptionChoiceEntity correctChoice = vote.getCorrectChoice();
        if (correctChoice == null) {
            throw new IllegalStateException("Correct choice is not set for this vote");
        }

        return settleInternal(vote, correctChoice);
    }

    /**
     * 🧮 실제 배당/정산 계산 로직
     * - 1) 전체 시장 totalPoints 계산
     * - 2) 각 choice 별 weight / odds 계산 및 저장
     * - 3) correctChoice 에 베팅한 유저들 가져와서 reward 계산
     */
    private VoteDetailSettlementResponse settleInternal(VoteEntity vote,
                                                        VoteOptionChoiceEntity correctChoice) {

        // ====== 1) 전체 시장, 승자 choice 포인트 집계 ======
        List<VoteOptionChoiceEntity> allChoices = vote.getOptions().stream()
                .flatMap((VoteOptionEntity o) -> o.getChoices().stream())
                .toList();

        int totalPool = allChoices.stream()
                .mapToInt(c -> c.getPointsTotal() == null ? 0 : c.getPointsTotal())
                .sum();

        int winnerPool = correctChoice.getPointsTotal() == null
                ? 0
                : correctChoice.getPointsTotal();

        if (totalPool <= 0 || winnerPool <= 0) {
            // 아무도 안 걸었거나 전체 풀이 0인 경우 → 정산 불가, odds=1.0 처리
            double defaultOdds = 1.0;
            correctChoice.setOdds(defaultOdds);
            choiceRepository.save(correctChoice);

            return VoteDetailSettlementResponse.builder()
                    .voteId(vote.getId())
                    .correctChoiceId(correctChoice.getId().intValue())
                    .totalPool(totalPool)
                    .winnerPool(winnerPool)
                    .winnerOdds(defaultOdds)
                    .winnerCount(0)
                    .distributedSum(0)
                    .build();
        }

        double feeRate = vote.getFeeRate() != null ? vote.getFeeRate() : 0.0;

        // ====== 2) 각 choice 별 weight / odds 계산 후 저장 ======
        for (VoteOptionChoiceEntity c : allChoices) {

            int pt = c.getPointsTotal() == null ? 0 : c.getPointsTotal();
            if (pt <= 0) {
                c.setOdds(0.0);
                continue;
            }

            double weight = (double) pt / (double) totalPool;  // 시장 내 비중
            double odds = (1.0 - feeRate) / weight;            // 배당률 공식

            c.setOdds(odds);
        }
        choiceRepository.saveAll(allChoices);

        double winnerOdds = correctChoice.getOdds() != null
                ? correctChoice.getOdds()
                : (1.0 - feeRate) / ((double) winnerPool / totalPool);

        // ====== 3) 승자에게 reward 지급 ======
        List<VoteUserEntity> winners = voteUserRepository.findByChoiceId(correctChoice.getId());

        int distributedSum = 0;
        for (VoteUserEntity vu : winners) {
            int bet = vu.getPointsBet() == null ? 0 : vu.getPointsBet();
            int reward = (int) Math.floor(bet * winnerOdds);

            distributedSum += reward;

            // TODO: 🔥 실제 유저 포인트 반영 (UserEntity 구조에 맞게 수정 필요)
            // UserEntity user = vu.getUser();
            // user.setPoints(user.getPoints() + reward);

            vu.setUpdatedAt(LocalDateTime.now());
        }

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
}
