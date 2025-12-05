package org.usyj.makgora.response.normalvote;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class NormalVoteListItemResponse {

    private Long id;
    private String title;
    private String description;
    private String status;
    private LocalDateTime endAt;
    private LocalDateTime createdAt;

    private Integer totalParticipants; // 모든 choice participantsCount 합계

    private List<NormalVoteOptionResponse> options;
}