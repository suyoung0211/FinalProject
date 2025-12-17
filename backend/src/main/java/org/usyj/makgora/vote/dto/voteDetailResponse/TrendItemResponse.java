package org.usyj.makgora.vote.dto.voteDetailResponse;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TrendItemResponse {

    private LocalDateTime recordedAt;

    private Integer optionId;
    private Integer choiceId;
    private String choiceText;

    private Double percent;      // 이 choice 점유율
    private Double odds;         // 이 choice 배당
    private Integer totalPoints; // 이 choice 누적 포인트
}
