package org.usyj.makgora.vote.dto.voteDetailResponse;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

/**
 * 🎯 VoteDetailParticipationResponse
 * 로그인한 유저가 해당 투표에 어떻게 참여했는지에 대한 정보.
 * - 어떤 옵션/선택지를 골랐는지
 * - 얼마를 걸었는지
 */
@Data @Builder
public class VoteDetailParticipationResponse {

    private Boolean hasParticipated;

    private Integer optionId;
    private Integer choiceId;

    private Integer pointsBet;         // 내가 건 포인트
    private LocalDateTime votedAt;

    private Double expectedOdds;
    private Integer expectedReward;
}
