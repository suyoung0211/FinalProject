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

    private Long choiceId;
    private String choiceText;

    private Integer pointsBet;

    private String result; // WIN / LOSE / PENDING / CANCELLED

    private LocalDateTime voteEndAt;
    private String voteStatus; // ONGOING / FINISHED / RESOLVED / REWARDED / CANCELLED
}
