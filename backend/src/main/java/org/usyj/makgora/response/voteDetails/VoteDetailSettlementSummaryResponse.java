package org.usyj.makgora.response.voteDetails;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class VoteDetailSettlementSummaryResponse {
    private Integer totalPool;
    private Integer winnerPool;
    private Double averageOdds;
    private Integer distributedPoints;

    private Integer winnerCount;
    private Integer loserCount;
}