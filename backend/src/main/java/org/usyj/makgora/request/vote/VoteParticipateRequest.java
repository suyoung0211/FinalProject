package org.usyj.makgora.request.vote;

import lombok.Data;

@Data
public class VoteParticipateRequest {
    private Long optionId;     // 사용자가 선택한 옵션 ID
    private Integer points;    // 베팅 포인트 (나중에 사용)
}
