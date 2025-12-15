package org.usyj.makgora.request.voteDetails;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

/**
 * 🎯 VoteDetailParticipateCancelRequest
 * 유저가 투표 참여(베팅)를 취소할 때 사용하는 Request DTO.
 * - 보통 특정 옵션(optionId) 또는 choiceId 단위로 취소 처리됨.
 * - 서버에서는 해당 사용자의 참여 내역을 조회 후 삭제(또는 취소 처리)한다.
 */
@Getter @Setter @Builder
public class VoteDetailParticipateCancelRequest {

    private Long voteId;        // 어느 투표인가
    private Long optionId;      // 어느 옵션에서 취소하는가
    private Long choiceId;      // YES / NO / DRAW 중 무엇을 취소하는가

    private Long userId;        // 참여한 사용자
}