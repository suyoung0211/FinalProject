package org.usyj.makgora.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.VoteEntity;
import org.usyj.makgora.entity.VoteOptionChoiceEntity;
import org.usyj.makgora.entity.VoteOptionEntity;
import org.usyj.makgora.repository.VoteOptionChoiceRepository;
import org.usyj.makgora.repository.VoteOptionRepository;
import org.usyj.makgora.repository.VoteRepository;
import org.usyj.makgora.response.vote.OddsResponse;
import org.usyj.makgora.response.voteDetails.ExpectedOddsResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OddsService {

    private final VoteRepository voteRepository;
    private final VoteOptionRepository optionRepository;
    private final VoteOptionChoiceRepository choiceRepository;

    /* =====================================================
       🔹 현재 배당률 조회 (DB에 저장된 odds 그대로)
       ===================================================== */
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
                                .odds(option.getOdds())
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
       🔹 예상 배당률 (AI 투표, 옵션 기준 시뮬레이션)
       ===================================================== */
    @Transactional(readOnly = true)
    public ExpectedOddsResponse getExpectedOdds(
            Integer voteId,
            Integer choiceId,
            Integer betAmount
    ) {

        // 1️⃣ Vote
        VoteEntity vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("Vote not found"));

        // 2️⃣ Choice
        VoteOptionChoiceEntity myChoice = choiceRepository.findById(choiceId)
                .orElseThrow(() -> new RuntimeException("Choice not found"));

        VoteOptionEntity myOption = myChoice.getOption();

        // 🔒 voteId 검증
        if (!myOption.getVote().getId().equals(voteId)) {
            throw new RuntimeException("voteId mismatch");
        }

        // 3️⃣ 패자 풀 계산 (내 choice 제외 모든 choice)
        int loserPool = optionRepository.findByVoteId(voteId).stream()
                .flatMap(option -> option.getChoices().stream())
                .filter(choice -> !choice.getId().equals(choiceId))
                .mapToInt(c -> c.getPointsTotal() != null ? c.getPointsTotal() : 0)
                .sum();

        // 4️⃣ 내 choice 참여자 수
        int myParticipants =
                myChoice.getParticipantsCount() != null
                        ? myChoice.getParticipantsCount()
                        : 0;

        // 5️⃣ 예상 1인당 수익
        double gainPerUser =
                myParticipants == 0
                        ? loserPool
                        : loserPool / (myParticipants + 1.0);

        // 6️⃣ 예상 보상
        int expectedReward = (int) Math.floor(
                betAmount + gainPerUser
        );

        // 7️⃣ 배당률
        double expectedOdds = expectedReward / (double) betAmount;

        return ExpectedOddsResponse.builder()
                .voteId(voteId)
                .optionId(myOption.getId())
                .choiceId(choiceId)
                .betAmount(betAmount)
                .expectedReward(expectedReward)
                .expectedOdds(expectedOdds)
                .feeRate(vote.getFeeRate() != null ? vote.getFeeRate() : 0.0)
                .build();
    }
}
