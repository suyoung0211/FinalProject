package org.usyj.makgora.request.voteDetails;

import lombok.Getter;
import lombok.Setter;

/**
 * 🎯 VoteDetailResolveRequest
 * - 어드민이 "이 투표의 정답 선택지"를 지정할 때 사용하는 요청 DTO
 * - 지정 후 바로 정산(배당 지급)까지 진행
 */
@Getter @Setter
public class VoteDetailResolveRequest {

    /** 정답으로 확정할 choiceId (VoteOptionChoiceEntity.choice_id) */
    private Long correctChoiceId;

    /** (선택) 이 작업을 수행하는 관리자 ID (로그 남기고 싶으면 사용) */
    private Integer adminUserId;
}
