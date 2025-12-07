package org.usyj.makgora.response.normalvote;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

import org.usyj.makgora.response.voteDetails.VoteDetailCommentResponse;

@Data
@Builder
public class NormalVoteResponse {

    private Long id;
    private String title;
    private String description;
    private LocalDateTime endAt;
    private String status;
    private Integer totalParticipants;
    private String category;
    private Integer commentCount;

    private LocalDateTime createdAt;

    private List<OptionResponse> options;

    @Data
    @Builder
    public static class OptionResponse {
        private Long optionId;
        private String optionTitle;
        private List<ChoiceResponse> choices;
    }

    private List<VoteDetailCommentResponse> comments;


    @Data
    @Builder
    public static class ChoiceResponse {
        private Long choiceId;
        private String choiceText;
        private Integer participantsCount;
    }
}