package org.usyj.makgora.vote.dto.voteDetailResponse;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NormalVoteParticipationResponse {

    private boolean hasParticipated;

    private Long optionId;
    private Long choiceId;

    private String choiceText;

    private String votedAt;
}