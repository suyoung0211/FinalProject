package org.usyj.makgora.response.voteDetails;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data @Builder
public class VoteDetailOddsResponse {

    private Integer voteId;

    private List<OddsItem> odds;

    @Data @Builder
    public static class OddsItem {
        private Integer choiceId;
        private String text;
        private Double odds;        // 현재 배당
        private List<OddsHistoryPoint> history;  // 🔥 배당 변화 기록 추가

        @Data @Builder
        public static class OddsHistoryPoint {
            private String timestamp;  // 예: "2025-12-07T14:33:10"
            private Double odds;       // 해당 시점 배당률
        }
    }
}
