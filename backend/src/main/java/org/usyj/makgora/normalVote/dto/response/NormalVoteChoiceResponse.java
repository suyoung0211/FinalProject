package org.usyj.makgora.normalVote.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NormalVoteChoiceResponse {

    private Long choiceId;            // YES/NO/DRAW choice ID
    private String text;              // "YES", "NO", "DRAW" 등
    private Integer participantsCount; // 참여자 수
}
