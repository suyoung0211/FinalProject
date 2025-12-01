package org.usyj.makgora.response.vote;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class MyVoteListResponse {

    private Long voteUserId;

    private Integer voteId;
    private String voteTitle;
    private String issueTitle;   // ⭐ 추가

    private Long choiceId;
    private String choiceText;

    private Integer pointsBet;
     private Integer rewardAmount; // ⭐ 승패 결과 금액 (+120, -250 등)

    private String result; // WIN / LOSE / PENDING / CANCELLED

    private LocalDateTime voteCreatedAt;
    private LocalDateTime voteEndAt;
    private String voteStatus; // ONGOING / FINISHED / RESOLVED / REWARDED / CANCELLED
}
