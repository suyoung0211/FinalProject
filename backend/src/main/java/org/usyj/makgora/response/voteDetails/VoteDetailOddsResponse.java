package org.usyj.makgora.response.voteDetails;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoteDetailOddsResponse {

    private Integer voteId;
    private List<OddsItem> odds;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OddsItem {
        private Integer choiceId;
        private String text;
        private Double odds;   // 현재 배당률
        private List<OddsHistoryItem> history;   // 🔥 히스토리 리스트
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OddsHistoryItem {
        private Double odds;        // 🔥 그 시점의 배당률 (프론트에서 chartData로 씀)
        private Double percent;     // 선택지 점유율 %
        private Integer totalPoints;// 당시 총 포인트
        private String timestamp;   // 기록된 시각 (문자열)
    }
}