package org.usyj.makgora.response.normalvote;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class NormalVoteDetailResponse {

    private Long id;
    private String title;
    private String description;
    private String category;

    private String status;
    private LocalDateTime endAt;
    private LocalDateTime createdAt;

    private Integer totalParticipants; // 모든 choice participantsCount 합계

    private List<OptionDetail> options;

    @Data
    @Builder
    public static class OptionDetail {
        private Long optionId;
        private String optionTitle;
        private List<ChoiceDetail> choices;
    }

    @Data
    @Builder
    public static class ChoiceDetail {
        private Long choiceId;
        private String choiceText;
        private Integer participantsCount;
    }
}