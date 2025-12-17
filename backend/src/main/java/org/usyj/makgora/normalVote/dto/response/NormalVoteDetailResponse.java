package org.usyj.makgora.normalVote.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

import org.usyj.makgora.vote.dto.voteDetailResponse.VoteDetailCommentResponse;
import org.usyj.makgora.vote.dto.voteDetailResponse.VoteDetailParticipationResponse;

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
    private Long myChoiceId;

    private List<OptionDetail> options;
    private List<VoteDetailCommentResponse> comments;
    private VoteDetailParticipationResponse myParticipation;

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
        private Double percent;
    }
}