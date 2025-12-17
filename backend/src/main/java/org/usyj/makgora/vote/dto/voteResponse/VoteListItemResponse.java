package org.usyj.makgora.vote.dto.voteResponse;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class VoteListItemResponse {

    private Integer id;
    private String title;
    private String category;
    private String description;
    private String thumbnail;
    private String url;
    private LocalDateTime endAt;
    private String status;
    private Integer totalPoints;
    private Integer totalParticipants;
    private LocalDateTime createdAt;

    private List<OptionItem> options;

    @Data
    @Builder
    public static class OptionItem {
        private Integer optionId;
        private String title;   // optionTitle 매핑
        private List<ChoiceItem> choices;
    }

    @Data
    @Builder
    public static class ChoiceItem {
        private Integer choiceId;
        private String text;    // choiceText 매핑
    }
}
