package org.usyj.makgora.response.voteDetails;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ExpectedOddsResponse {

    private Integer voteId;
    private Integer optionId;
    private Integer choiceId;
    private Integer betAmount;
    private Double expectedOdds;
    private Integer expectedReward;
    private Double feeRate;
}
