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

    // 🔥 옵션 기준 odds 리스트
    private List<OddsItem> odds;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OddsItem {

        private Long optionId;
        private String optionTitle;

        // 현재 옵션 배당률
        private Double odds;

        // 🔥 옵션 기준 히스토리
        private List<OddsHistoryItem> history;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OddsHistoryItem {

        private Double odds;          // 당시 옵션 배당률
        private Double percent;       // 옵션 점유율 %
        private Integer totalPoints;  // 전체 포인트
        private String timestamp;
    }
}
