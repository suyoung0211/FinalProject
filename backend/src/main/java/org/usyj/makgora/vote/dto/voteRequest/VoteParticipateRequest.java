package org.usyj.makgora.vote.dto.voteRequest;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter @Setter
public class VoteParticipateRequest {
    // 사용자가 선택한 choice_id
    private Integer choiceId;

    // 베팅 포인트
    private Integer points;
}