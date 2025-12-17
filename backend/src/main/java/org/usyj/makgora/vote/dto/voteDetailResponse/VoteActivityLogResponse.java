package org.usyj.makgora.vote.dto.voteDetailResponse;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class VoteActivityLogResponse {
    private Integer userId;
    private String action;   // BET / CANCEL / COMMENT / LIKE / DISLIKE
    private LocalDateTime timestamp;
    private String detail;   // 예: "YES에 20포인트 베팅"
}
