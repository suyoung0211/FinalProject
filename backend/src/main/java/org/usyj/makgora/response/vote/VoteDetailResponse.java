package org.usyj.makgora.response.vote;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class VoteDetailResponse {
    private Integer id;
    private Integer issueId;
    private String title;
    private String description;

    private LocalDateTime createdAt;
    private LocalDateTime deadline;

    private Integer totalVolume;      // 전체 베팅 포인트
    private Integer participants;     // 참여자 수
    private String status;

    private List<VoteOptionDto> options;

    @Data
    @Builder
    public static class VoteOptionDto {
        private Long id;
        private String label;
        private Integer count;
        private Integer points;    // 베팅된 포인트
    }
}