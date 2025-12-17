package org.usyj.makgora.vote.dto.voteDetailResponse;

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