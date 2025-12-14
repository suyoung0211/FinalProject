package org.usyj.makgora.service;

import java.util.List;

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

    private final VoteRepository voteRepository;
    private final VoteOptionRepository optionRepository;
    private final VoteUserRepository voteUserRepository;
    private final VoteOptionChoiceRepository choiceRepository;

    @Transactional(readOnly = true)
public OddsResponse getCurrentOdds(Integer voteId) {

    VoteEntity vote = voteRepository.findById(voteId)
            .orElseThrow(() -> new RuntimeException("vote 없음"));

    double feeRate = vote.getFeeRate() == null ? 0.10 : vote.getFeeRate();
    int baseBet = 100; // 🔥 UI 기준 배팅 금액

    List<OddsResponse.OptionOdds> options =
            vote.getOptions().stream()
                    .map(option -> {

                        int optionId = option.getId();

                        // 🔥 실시간 집계 (핵심)
                        int optionPool =
                                voteUserRepository.sumPointsByOptionId(optionId);

                        int participants =
                                voteUserRepository.countParticipantsByOptionId(optionId);

                        double odds = calcDisplayOdds(
                                optionPool,
                                participants,
                                feeRate,
                                baseBet
                        );

                        return OddsResponse.OptionOdds.builder()
                                .optionId(optionId)
                                .optionTitle(option.getOptionTitle())
                                .optionPool(optionPool)
                                .participantsCount(participants)
                                .odds(odds)
                                .build();
                    })
                    .toList();

    return OddsResponse.builder()
            .voteId(vote.getId())
            .feeRate(feeRate)
            .options(options)
            .build();
}


    /* =====================================================
       🔹 예상 배당률 (유저 베팅 시뮬레이션)
       ===================================================== */
    @Transactional(readOnly = true)
public ExpectedOddsResponse getExpectedOdds(
        Integer voteId,
        Integer choiceId,
        Integer pointsBet
) {
    VoteEntity vote = voteRepository.findById(voteId)
            .orElseThrow(() -> new VoteException("VOTE_NOT_FOUND", "Vote not found"));

    VoteOptionChoiceEntity choice = choiceRepository.findById(choiceId)
            .orElseThrow(() -> new VoteException("CHOICE_NOT_FOUND", "Choice not found"));

    VoteOptionEntity option = choice.getOption();

    if (!option.getVote().getId().equals(vote.getId())) {
        throw new VoteException("INVALID_CHOICE", "Choice does not belong to vote");
    }

    if (pointsBet == null || pointsBet <= 0) {
        return ExpectedOddsResponse.builder()
                .expectedOdds(1.0)
                .expectedReward(0)
                .build();
    }

    double feeRate = vote.getFeeRate() != null ? vote.getFeeRate() : 0.1;

    // 🔹 현재 풀 (DB 기준)
    long optionPool =
            option.getPointsTotal() != null ? option.getPointsTotal() : 0;

    long choicePool =
            choice.getPointsTotal() != null ? choice.getPointsTotal() : 0;

    // 🔹 내가 베팅했을 때의 미래 상태
    long newOptionPool = optionPool + pointsBet;
    long newChoicePool = choicePool + pointsBet;

    if (newChoicePool <= 0) {
        return ExpectedOddsResponse.builder()
                .expectedOdds(1.0)
                .expectedReward(pointsBet)
                .build();
    }

    long distributable =
            (long) Math.floor(newOptionPool * (1.0 - feeRate));

    double expectedOdds =
            (double) distributable / newChoicePool;

    if (expectedOdds < 1.0) expectedOdds = 1.0;

    expectedOdds = round(expectedOdds);

    int expectedReward =
            (int) Math.floor(pointsBet * expectedOdds);

    return ExpectedOddsResponse.builder()
            .expectedOdds(expectedOdds)
            .expectedReward(expectedReward)
            .build();
}


    /* =====================================================
       🔹 옵션 배당률 표시용 (기본 bet 기준)
       ===================================================== */
    @Transactional(readOnly = true)
public double getOptionOddsForDisplay(
        Integer voteId,
        Integer optionId,
        int baseBet
) {
    VoteEntity vote = voteRepository.findById(voteId)
            .orElseThrow(() -> new RuntimeException("Vote not found"));

    VoteOptionEntity option = optionRepository.findById(optionId)
            .orElseThrow(() -> new RuntimeException("Option not found"));

    double feeRate = vote.getFeeRate() != null ? vote.getFeeRate() : 0.10;

    long pool =
            option.getPointsTotal() != null
                    ? option.getPointsTotal()
                    : 0;

    long participants =
            option.getParticipantsCount() != null
                    ? option.getParticipantsCount()
                    : 0;

    if (participants <= 0 || pool <= 0) return 1.0;

    long distributable =
            (long) Math.floor(pool * (1.0 - feeRate));

    if (baseBet <= 0) baseBet = 100;

    double odds =
            ((double) distributable / participants) / baseBet;

    return round(odds);
}

private double round(double v) {
    return Math.round(v * 100.0) / 100.0;
}

private double calcDisplayOdds(
        int pool,
        int participants,
        double feeRate,
        int baseBet
) {
    if (pool <= 0 || participants <= 0) return 1.0;

    double distributable = pool * (1.0 - feeRate);
    double odds = (distributable / participants) / Math.max(baseBet, 1);

    if (odds < 1.0) odds = 1.0;
    return round(odds);
}
}
