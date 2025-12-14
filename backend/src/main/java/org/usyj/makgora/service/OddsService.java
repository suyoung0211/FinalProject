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

    double feeRate = vote.getFeeRate() == null ? 0.0 : vote.getFeeRate();

    List<OddsResponse.OptionOdds> options =
            vote.getOptions().stream()
                    .map(option -> OddsResponse.OptionOdds.builder()
                            .optionId(option.getId())
                            .optionTitle(option.getOptionTitle())
                            .optionPool(
                                    option.getPointsTotal() != null
                                            ? option.getPointsTotal()
                                            : 0
                            )
                            .participantsCount(
                                    option.getParticipantsCount() != null
                                            ? option.getParticipantsCount()
                                            : 0
                            )
                            .odds(option.getOdds()) // 🔥 정산 전이면 계산값 or null
                            .build()
                    )
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
            .orElseThrow(() -> new RuntimeException("Vote not found"));

    VoteOptionChoiceEntity choice =
            choiceRepository.findById(choiceId)
                    .orElseThrow(() -> new RuntimeException("Choice not found"));

    VoteOptionEntity option = choice.getOption();

    double feeRate = vote.getFeeRate() != null ? vote.getFeeRate() : 0.10;

    int optionTotalPoints =
            voteUserRepository.sumPointsByOptionId(option.getId());

    int currentWinners =
            voteUserRepository.countByVote_IdAndChoice_Id(
                    voteId,
                    choiceId
            );

    int newTotalPoints = optionTotalPoints + pointsBet;
    int newWinnerCount = currentWinners + 1;

    double odds =
            ((double) newTotalPoints * (1.0 - feeRate))
                    / newWinnerCount
                    / pointsBet;

    if (odds < 1.0) odds = 1.0;

    return ExpectedOddsResponse.builder()
            .expectedOdds(round(odds))
            .expectedReward((int) Math.floor(pointsBet * odds))
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

        double feeRate = vote.getFeeRate() != null ? vote.getFeeRate() : 0.10;

        int optionPool =
                voteUserRepository.sumPointsByOptionId(optionId);

        int participants =
                voteUserRepository.countParticipantsByOptionId(optionId);

        if (participants <= 0 || optionPool <= 0) return 1.0;

        int distributed =
                (int) Math.floor(optionPool * (1.0 - feeRate));

        if (baseBet <= 0) baseBet = 100;

        double odds =
                ((double) distributed / participants) / baseBet;

        return round(odds);
    }

    private double round(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
