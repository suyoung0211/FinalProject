package org.usyj.makgora.request.vote;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VoteParticipateRequest {

    private Long optionId;   // 유저가 선택한 옵션 (YES/NO/MULTI)
    private Integer points;  // 사용자가 베팅하는 포인트
}
