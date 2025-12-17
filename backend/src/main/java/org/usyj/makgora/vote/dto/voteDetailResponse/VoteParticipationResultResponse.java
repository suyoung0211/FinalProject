package org.usyj.makgora.vote.dto.voteDetailResponse;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VoteParticipationResultResponse {
    private Integer beforePoints;
    private Integer usedPoints;
    private Integer afterPoints;
    private Integer newLevel;
    private boolean success;
}