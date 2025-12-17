package org.usyj.makgora.vote.dto.voteResponse;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class VoteStatisticsResponse {

    private Integer totalBets;      // 총 베팅 수
    private Integer wins;           // 승
    private Integer losses;         // 패
    private Integer pending;        // 결과 대기중(취소 포함)

    private Double winRate;         // 승률 (0.0 ~ 1.0)
    private Integer currentWinStreak;  // 현재 연승
    private Integer maxWinStreak;      // 최대 연승
}
