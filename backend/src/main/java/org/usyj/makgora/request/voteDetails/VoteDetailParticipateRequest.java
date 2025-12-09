package org.usyj.makgora.request.voteDetails;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

/**
 * 🎯 VoteDetailParticipateRequest
 * 유저가 투표 옵션에 YES/NO/DRAW 중 하나를 선택하고 포인트를 베팅할 때 보내는 요청 DTO.
 */
@Getter @Setter @Builder
public class VoteDetailParticipateRequest {

    private Integer voteId;
    private Integer optionId;
    private Integer choiceId;

    private Integer userId;
    private Long amount;
}