package org.usyj.makgora.request.voteDetails;

import lombok.Data;

@Data
public class VoteParticipationRequest {
    private Integer optionId;
    private Integer choiceId;  // YES / NO 중 선택
    private Long pointsBet;   // 유저가 건 포인트
}