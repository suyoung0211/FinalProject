package org.usyj.makgora.normalVote.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class NormalVoteParticipateResponse {
    private Long voteId;      // ← Integer → Long 으로 수정
    private Long optionId;
    private Long choiceId;
    private Integer userId;
    private Integer participantsCount;
}