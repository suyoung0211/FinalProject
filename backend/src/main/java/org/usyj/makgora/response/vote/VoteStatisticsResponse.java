package org.usyj.makgora.response.vote;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class VoteStatisticsResponse {

    private Integer totalBets;
    private Integer wins;
    private Integer losses;
    private Integer pending;

    private Double winRate;

    private Integer currentWinStreak;
    private Integer maxWinStreak;
}
