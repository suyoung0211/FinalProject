package org.usyj.makgora.response.vote;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class MyVoteListResponse {

    private Long voteUserId;          // 베팅 거래 ID
    private Integer voteId;           // 투표 ID
    private String voteTitle;         // 투표 제목
    private String issueTitle;        // 이슈 제목
    
    private Long choiceId;
    private String choiceText;

    private Integer pointsBet;        // 내가 건 포인트
    private Integer rewardAmount;     // 이득/손실 값 (정산 후)

    private String result;            // WIN / LOSE / CANCELLED / PENDING
    private LocalDateTime voteCreatedAt;
    private LocalDateTime voteEndAt;
    private String voteStatus;        // ONGOING / FINISHED / etc
}
