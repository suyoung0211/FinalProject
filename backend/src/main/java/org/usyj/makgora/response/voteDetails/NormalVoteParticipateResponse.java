package org.usyj.makgora.response.voteDetails;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class NormalVoteParticipateResponse {
    private Integer voteId;
    private Long optionId;
    private Long choiceId;
    private Integer userId;
    private Integer participantsCount;
}