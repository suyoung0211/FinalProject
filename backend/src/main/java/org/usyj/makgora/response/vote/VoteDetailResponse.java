package org.usyj.makgora.response.vote;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VoteDetailResponse {

    private Integer id;
    private Integer issueId;
    private String title;
    private String status;
    private LocalDateTime endAt;

    private Integer totalPoints;
    private Integer totalParticipants;

    private List<OptionDto> options;

    @Data
    @Builder
    public static class OptionDto {
        private Long optionId;       // YES / NO 같은 옵션 ID
        private String optionTitle;  // YES / NO
        private Integer pointsTotal; // YES 누적 포인트
        private Integer participantsCount; // YES 참여자
        private Double odds;         // 배당률
    }
}