package org.usyj.makgora.vote.dto.voteResponse;


import java.util.List;
import java.util.Map;

import lombok.Builder;

import lombok.Getter;

@Getter
@Builder
public class VoteTrendChartResponse {

    private Integer voteId;
    private List<OptionTrendChart> options;

    @Getter
    @Builder
    public static class OptionTrendChart {
        private Integer optionId;
        private String optionTitle;
        private List<Map<String, Object>> chart;
    }
}
