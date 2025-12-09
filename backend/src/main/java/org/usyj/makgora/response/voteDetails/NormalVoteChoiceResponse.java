package org.usyj.makgora.response.voteDetails;

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
