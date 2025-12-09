package org.usyj.makgora.response.voteDetails;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

/**
 * 🎯 VoteDetailStatPointResponse
 * 특정 시간(timestamp)에서 YES/NO/DRAW 비율을 기록한 데이터.
 * 그래프 렌더링에 직접 사용됨.
 */
@Getter @Setter @Builder
public class VoteDetailStatPointResponse {

    private LocalDateTime timestamp;
    private Double yesRate;
    private Double noRate;
    private Double drawRate;
}
