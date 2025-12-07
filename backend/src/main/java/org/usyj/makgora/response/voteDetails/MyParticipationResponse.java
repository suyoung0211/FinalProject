package org.usyj.makgora.response.voteDetails;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MyParticipationResponse {
    private boolean hasParticipated;
    private Integer optionId;
    private Integer choiceId;
    private Long pointsBet;
    private LocalDateTime votedAt;
}
