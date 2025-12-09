package org.usyj.makgora.response.voteDetails;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class VoteDetailBettorSummaryResponse {
    private Integer choiceId;
    private String choiceText;

    private Integer totalParticipants;
    private Integer totalPoints;

    private List<BettorItem> bettors;

    @Data @Builder
    public static class BettorItem {
        private Integer userId;
        private String nickname;
        private Integer pointsBet;
        private LocalDateTime betAt;
    }
}