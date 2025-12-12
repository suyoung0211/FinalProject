package org.usyj.makgora.response.voteDetails;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class VoteDetailSettlementResponse {

    private Integer voteId;
    private Integer totalDistributed;
    private Integer totalWinnerCount;

    private List<OptionSettlementResult> options;

    @Getter
    @Setter
    @Builder
    public static class OptionSettlementResult {
        private Long optionId;
        private Long correctChoiceId;
        private Double odds;
        private Integer optionPool;
        private Integer winnerPool;
        private Integer winnerCount;
        private Integer distributedSum;
    }
}
