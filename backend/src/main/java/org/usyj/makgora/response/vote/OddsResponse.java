package org.usyj.makgora.response.vote;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter @Builder
public class OddsResponse {

    private Integer voteId;
    private Double feeRate;
    private List<OptionOdds> options;

    @Getter @Builder
    public static class OptionOdds {
        private Long optionId;
        private String optionTitle;
        private Integer optionPool;
        private List<ChoiceOdds> choices;
    }

    @Getter @Builder
    public static class ChoiceOdds {
        private Long choiceId;
        private String choiceText;
        private Integer pointsTotal;
        private Integer participantsCount;
        private Double odds;
    }
}
