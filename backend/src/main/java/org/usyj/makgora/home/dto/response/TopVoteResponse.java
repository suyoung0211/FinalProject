package org.usyj.makgora.home.dto.response;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter @Builder
public class TopVoteResponse {
    private Integer voteId;
    private String title;
    private String status;
    private LocalDateTime endAt;
    private Integer totalPoints;
}