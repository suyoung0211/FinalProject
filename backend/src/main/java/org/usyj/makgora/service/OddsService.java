package org.usyj.makgora.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.VoteEntity;
import org.usyj.makgora.entity.VoteOptionChoiceEntity;
import org.usyj.makgora.entity.VoteOptionEntity;
import org.usyj.makgora.exception.VoteException;
import org.usyj.makgora.repository.VoteOptionChoiceRepository;
import org.usyj.makgora.repository.VoteOptionRepository;
import org.usyj.makgora.repository.VoteRepository;
import org.usyj.makgora.repository.VoteUserRepository;
import org.usyj.makgora.response.vote.OddsResponse;
import org.usyj.makgora.response.voteDetails.ExpectedOddsResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class OddsService {

    /**
     * EPSILON
     * - ONGOING 상태에서 예상 배당률 계산 시 사용
     * - choicePool = 0 인 경우 division by zero 방지
     * - 초기 배당률 튐 완화용
     * - ⚠️ 정산(FINAL) 단계에서는 사용하지 않음
     */
    private static final double EPSILON = 1.0;

    private final VoteRepository voteRepository;
    private final VoteOptionRepository optionRepository;
    private final VoteUserRepository voteUserRepository;
    private final VoteOptionChoiceRepository choiceRepository;

    private static final double MAX_ODDS = 10.0;

    /* =====================================================
       🔹 현재 배당률 조회 (상세페이지용)
       ===================================================== */
    @Transactional(readOnly = true)
public OddsResponse getCurrentOdds(Integer voteId) {

    VoteEntity vote = voteRepository.findById(voteId)
            .orElseThrow(() -> new RuntimeException("vote 없음"));

    double feeRate = vote.getFeeRate() != null ? vote.getFeeRate() : 0.10;

    List<OddsResponse.OptionOdds> options =
            vote.getOptions().stream().map(option -> {

                Integer optionId = option.getId();

                Integer totalPool =
                        voteUserRepository.sumPointsByOptionId(optionId);

                // 🔥 정답 choice 풀
                VoteOptionChoiceEntity correctChoice =
                        option.getCorrectChoice();

                long winnerPool =
                        (correctChoice != null)
                                ? voteUserRepository.sumPointsByChoiceId(correctChoice.getId())
                                : 0;

                double odds;

                if (totalPool <= 0 || winnerPool <= 0) {
                    odds = 1.0;
                } else {
                    odds = (double) totalPool / winnerPool;
                }

                odds = odds * (1.0 - feeRate);
                odds = Math.min(MAX_ODDS, Math.max(1.0, round(odds)));

                return OddsResponse.OptionOdds.builder()
                        .optionId(optionId)
                        .optionTitle(option.getOptionTitle())
                        .optionPool((int) totalPool)
                        .participantsCount(option.getParticipantsCount())
                        .odds(odds)
                        .build();

            }).toList();

    return OddsResponse.builder()
            .voteId(vote.getId())
            .feeRate(feeRate)
            .options(options)
            .build();
}

    /* =====================================================
       🔹 예상 배당률 (베팅 직전 시뮬레이션)
       ===================================================== */
    @Transactional(readOnly = true)
    public ExpectedOddsResponse getExpectedOdds(
            Integer voteId,
            Integer choiceId,
            Integer pointsBet
    ) {
        if (pointsBet == null || pointsBet <= 0) {
            return ExpectedOddsResponse.builder()
                    .expectedOdds(1.0)
                    .expectedReward(0)
                    .build();
        }

        VoteEntity vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new VoteException("VOTE_NOT_FOUND", "Vote not found"));

        VoteOptionChoiceEntity choice = choiceRepository.findById(choiceId)
                .orElseThrow(() -> new VoteException("CHOICE_NOT_FOUND", "Choice not found"));

        VoteOptionEntity option = choice.getOption();

        if (!option.getVote().getId().equals(vote.getId())) {
            throw new VoteException("INVALID_CHOICE", "Choice does not belong to vote");
        }

        double feeRate = vote.getFeeRate() != null ? vote.getFeeRate() : 0.10;

        Integer optionPool =
                voteUserRepository.sumPointsByOptionId(option.getId());

        Integer choicePool =
                voteUserRepository.sumPointsByChoiceId(choice.getId());

        long newOptionPool = optionPool + pointsBet;
        long newChoicePool = choicePool + pointsBet;

        double rawOdds =
    (double) newOptionPool / (newChoicePool + EPSILON);

        rawOdds = rawOdds * (1.0 - feeRate);

        double odds = Math.min(
            MAX_ODDS,
            Math.max(1.0, round(rawOdds))
        );

        odds = odds * (1.0 - feeRate);
        odds = Math.max(1.0, round(odds));

        int expectedReward =
                (int) Math.floor(pointsBet * odds);

        return ExpectedOddsResponse.builder()
                .expectedOdds(odds)
                .expectedReward(expectedReward)
                .build();
    }

    /* =====================================================
       🔹 옵션 단위 배당률 (리스트/요약용)
       ===================================================== */
    @Transactional(readOnly = true)
    public double getOptionOddsForDisplay(
            Integer voteId,
            Long optionId,
            int baseBet
    ) {
        VoteEntity vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("Vote not found"));

        VoteOptionEntity option = optionRepository.findById(optionId)
                .orElseThrow(() -> new RuntimeException("Option not found"));

        double feeRate = vote.getFeeRate() != null ? vote.getFeeRate() : 0.10;

        long pool = option.getPointsTotal() != null ? option.getPointsTotal() : 0;
        long participants = option.getParticipantsCount() != null ? option.getParticipantsCount() : 0;

        if (participants <= 0 || pool <= 0) return 1.0;

        long distributable =
                (long) Math.floor(pool * (1.0 - feeRate));

        if (baseBet <= 0) baseBet = 100;

        double odds =
                ((double) distributable / participants) / baseBet;

        return round(Math.max(1.0, odds));
    }

    /* =====================================================
       🔹 Util
       ===================================================== */
    private double round(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    public double calculateCurrentOdds(VoteEntity vote, VoteOptionChoiceEntity choice) {

        VoteOptionEntity option = choice.getOption();

        long optionTotalPoints =
                option.getPointsTotal() != null
                        ? option.getPointsTotal()
                        : 0;

        long choicePoints =
                choice.getPointsTotal() != null
                        ? choice.getPointsTotal()
                        : 0;

        double feeRate =
                vote.getFeeRate() != null
                        ? vote.getFeeRate()
                        : 0.0;

        if (choicePoints <= 0) {
            return MAX_ODDS;
        }

        double rawOdds =
                (double) optionTotalPoints * (1.0 - feeRate) / choicePoints;

        return Math.max(1.0, Math.min(MAX_ODDS, rawOdds));
    }

    public double calculateChoiceOdds(
        VoteEntity vote,
        VoteOptionEntity option,
        VoteOptionChoiceEntity choice
) {
    long totalPoints =
        Optional.ofNullable(option.getPointsTotal()).orElse(0);

    long choicePoints =
        Optional.ofNullable(choice.getPointsTotal()).orElse(0);

    double feeRate =
        Optional.ofNullable(vote.getFeeRate()).orElse(0.0);

    if (choicePoints == 0) return 10.0;

    double odds =
        (totalPoints * (1.0 - feeRate)) / choicePoints;

    return Math.min(10.0, Math.max(1.0, odds));
}

}
