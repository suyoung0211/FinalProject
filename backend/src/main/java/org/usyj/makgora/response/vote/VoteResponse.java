package org.usyj.makgora.response.vote;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
public class VoteResponse {

    private Integer voteId;
    private String title;
    private LocalDateTime endAt;

    private List<OptionResponse> options;

    @Getter
    @Setter
    @Builder
    public static class OptionResponse {
        private Long optionId;
        private String optionTitle;
        private List<ChoiceResponse> choices;
    }

    @Getter
    @Setter
    @Builder
    public static class ChoiceResponse {
        private Long choiceId;
        private String choiceText;
        private Integer pointsTotal;
        private Integer participantsCount;
        private Double odds;
    }
}
