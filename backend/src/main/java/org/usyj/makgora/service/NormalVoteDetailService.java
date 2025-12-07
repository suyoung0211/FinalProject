package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.*;
import org.usyj.makgora.repository.*;
import org.usyj.makgora.response.normalvote.NormalVoteDetailResponse;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NormalVoteDetailService {

    private final NormalVoteRepository normalVoteRepository;
    private final NormalVoteOptionRepository optionRepository;
    private final NormalVoteChoiceRepository choiceRepository;

    public NormalVoteDetailResponse getDetail(Long normalVoteId) {

        NormalVoteEntity vote = normalVoteRepository.findById(normalVoteId)
                .orElseThrow(() -> new RuntimeException("NormalVote not found"));

        List<NormalVoteOptionEntity> options =
                optionRepository.findByNormalVote_Id(normalVoteId);

        int totalParticipants = options.stream()
                .flatMap(o -> o.getChoices().stream())
                .mapToInt(c -> c.getParticipantsCount())
                .sum();

        return NormalVoteDetailResponse.builder()
                .id(vote.getId())
                .title(vote.getTitle())
                .description(vote.getDescription())
                .category(vote.getCategory() != null ? vote.getCategory().name() : null)
                .status(vote.getStatus().name())
                .endAt(vote.getEndAt())
                .createdAt(vote.getCreatedAt())
                .totalParticipants(totalParticipants)
                .options(
                        options.stream().map(opt ->
                                NormalVoteDetailResponse.OptionDetail.builder()
                                        .optionId(opt.getId())
                                        .optionTitle(opt.getOptionTitle())
                                        .choices(
                                                opt.getChoices().stream()
                                                        .map(choice -> NormalVoteDetailResponse.ChoiceDetail.builder()
                                                                .choiceId(choice.getId())
                                                                .choiceText(choice.getChoiceText())
                                                                .participantsCount(choice.getParticipantsCount())
                                                                .build()
                                                        ).toList()
                                        )
                                        .build()
                        ).toList()
                )
                .build();
    }
}
