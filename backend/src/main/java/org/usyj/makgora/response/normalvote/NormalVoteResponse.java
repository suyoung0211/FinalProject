package org.usyj.makgora.response.normalvote;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class NormalVoteResponse {

    private Long id;
    private String title;
    private String description;
    private LocalDateTime endAt;
    private String status;
    private Integer totalParticipants;

    private LocalDateTime createdAt;

    private List<OptionResponse> options;

    @Data
    @Builder
    public static class OptionResponse {
        private Long optionId;
        private String optionTitle;
        private List<ChoiceResponse> choices;
    }

    @Data
    @Builder
    public static class ChoiceResponse {
        private Long choiceId;
        private String choiceText;
        private Integer participantsCount;
    }
}