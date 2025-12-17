package org.usyj.makgora.normalVote.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.normalVote.entity.NormalVoteEntity;
import org.usyj.makgora.normalVote.entity.NormalVoteOptionEntity;
import org.usyj.makgora.normalVote.repository.NormalVoteOptionRepository;
import org.usyj.makgora.normalVote.repository.NormalVoteRepository;
import org.usyj.makgora.vote.dto.voteDetailResponse.NormalVoteResultResponse;
import org.usyj.makgora.vote.repository.VoteUserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NormalVoteResultService {

    private final NormalVoteRepository normalVoteRepository;
    private final NormalVoteOptionRepository optionRepository;
    private final VoteUserRepository voteUserRepository;

    public NormalVoteResultResponse getResult(Integer normalVoteId) {

        NormalVoteEntity vote = normalVoteRepository.findById(normalVoteId)
                .orElseThrow(() -> new RuntimeException("Normal Vote not found"));

        List<NormalVoteOptionEntity> options =
                optionRepository.findByNormalVote_Id(normalVoteId);

        int totalParticipants = voteUserRepository.countByNormalVote_Id(normalVoteId);

        List<NormalVoteResultResponse.OptionResult> optionResults =
                options.stream()
                        .map(opt -> {

                            int count = voteUserRepository
                                    .countByNormalChoice_NormalOption_Id(opt.getId());

                            double percent = 0.0;
                            if (totalParticipants > 0) {
                                percent = Math.round((count * 1000.0 / totalParticipants)) / 10.0;
                            }

                            return NormalVoteResultResponse.OptionResult.builder()
                                    .optionId(opt.getId())
                                    .title(opt.getOptionTitle())
                                    .participants(count)
                                    .percent(percent)
                                    .build();
                        })
                        .toList();

        return NormalVoteResultResponse.builder()
                .normalVoteId(normalVoteId)
                .title(vote.getTitle())
                .status(vote.getStatus().name())
                .totalParticipants(totalParticipants)
                .options(optionResults)
                .build();
    }
}
