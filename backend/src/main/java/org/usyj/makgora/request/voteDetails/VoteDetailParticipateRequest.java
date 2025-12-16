package org.usyj.makgora.request.voteDetails;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class VoteDetailParticipateRequest {

    private Long choiceId;      // 유저가 선택한 choice
    private Integer pointsBet;  // 베팅 포인트
}
