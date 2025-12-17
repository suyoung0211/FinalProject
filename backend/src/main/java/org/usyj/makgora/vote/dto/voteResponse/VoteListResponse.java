package org.usyj.makgora.vote.dto.voteResponse;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class VoteListResponse {
    private Integer id;
    private String category;
    private String title;
    private String description;
    private String status;
    private LocalDateTime endAt;
    private Integer totalParticipants;
    private Integer totalPoints;
    private List<VoteOptionResponse> options;
}