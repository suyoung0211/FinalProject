package org.usyj.makgora.response.vote;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class VoteResponse {
    private Integer id;
    private Integer issueId;
    private String title;
    private String status;
    private LocalDateTime endAt;
    private Integer totalPoints; 
    private Integer totalParticipants;
}