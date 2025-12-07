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
        private Double yesPercent;
        private Double noPercent;
    }
}