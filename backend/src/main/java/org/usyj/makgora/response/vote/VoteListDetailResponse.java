package org.usyj.makgora.response.vote;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class VoteListDetailResponse {

    private Integer voteId;
    private Integer issueId;

    private String title;
    private String description;
    private String status;

    private LocalDateTime createdAt;
    private LocalDateTime endAt;

    private Stats stats;
    private Rule rule;

    private String category;
    private String thumbnail;

    private List<OptionResponse> options;

    @Data
    @Builder
    public static class Stats {
        private Integer totalPoints;
        private Integer totalParticipants;
    }

    @Data
    @Builder
    public static class Rule {
        private String type;
        private String description;
    }

    @Data
    @Builder
    public static class OptionResponse {
        private Long optionId;
        private String title;
        private List<ChoiceResponse> choices;
    }

    @Data
    @Builder
    public static class ChoiceResponse {
        private Long choiceId;
        private String text;
        private Integer pointsTotal;
        private Integer participantsCount;
        private Double odds;
    }
}
