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
        private Integer optionId;
        private Integer correctChoiceId;
        private Double odds;
        private int optionPool;
        private int winnerPool;
        private int winnerCount;
        private int distributedSum;
    }
}
