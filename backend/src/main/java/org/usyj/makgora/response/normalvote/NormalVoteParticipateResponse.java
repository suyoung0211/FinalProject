package org.usyj.makgora.response.normalvote;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NormalVoteParticipateResponse {
    private Long choiceId;
    private String choiceText;
    private Integer participantsCount;
}