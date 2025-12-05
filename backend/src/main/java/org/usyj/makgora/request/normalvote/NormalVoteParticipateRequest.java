package org.usyj.makgora.request.normalvote;

import lombok.Data;

@Data
public class NormalVoteParticipateRequest {
    private Long choiceId;  // 어떤 선택지에 투표했는지
}