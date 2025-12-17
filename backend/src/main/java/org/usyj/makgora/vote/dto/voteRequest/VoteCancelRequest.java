package org.usyj.makgora.vote.dto.voteRequest;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VoteCancelRequest {
    private String reason; // 투표 취소 사유
}