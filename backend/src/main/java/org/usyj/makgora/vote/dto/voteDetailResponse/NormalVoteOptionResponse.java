package org.usyj.makgora.vote.dto.voteDetailResponse;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class NormalVoteOptionResponse {

    private Long optionId;
    private String title;
    private Integer totalParticipants;

    private List<NormalVoteChoiceResponse> choices;
}