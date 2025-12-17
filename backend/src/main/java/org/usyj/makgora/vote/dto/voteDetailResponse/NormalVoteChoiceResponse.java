package org.usyj.makgora.vote.dto.voteDetailResponse;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NormalVoteChoiceResponse {

    private Long choiceId;
    private String text;
    private Integer participantsCount;
    private Double percent;
}
