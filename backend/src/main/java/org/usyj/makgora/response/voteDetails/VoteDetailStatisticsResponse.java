package org.usyj.makgora.response.voteDetails;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data @Builder
public class VoteDetailStatisticsResponse {
    private List<TrendSnapshot> changes;

    @Data @Builder
    public static class TrendSnapshot {
        private String timestamp;
        private List<OptionTrendItem> optionTrends;
    }

    @Data @Builder
    public static class OptionTrendItem {
        private Integer choiceId;
        private String text;
        private Double percent;
    }
}
