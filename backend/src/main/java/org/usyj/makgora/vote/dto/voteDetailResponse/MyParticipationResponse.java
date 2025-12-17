package org.usyj.makgora.vote.dto.voteDetailResponse;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MyParticipationResponse {
    private boolean hasParticipated;
    private boolean isCancelled;
    private Integer optionId;
    private Integer choiceId;
    private Long pointsBet;
    private Double oddsAtParticipation;   // 🔥 참여 시점 배당
    private Integer expectedReward;        // 🔥 pointsBet * odds
    private LocalDateTime votedAt;
    private LocalDateTime canceledAt;
    
}
