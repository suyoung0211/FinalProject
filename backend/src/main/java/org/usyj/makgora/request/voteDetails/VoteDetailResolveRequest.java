package org.usyj.makgora.request.voteDetails;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

/**
 * 🎯 VoteDetailResolveRequest
 * - 어드민이 "이 투표의 정답 선택지"를 지정할 때 사용하는 요청 DTO
 * - 지정 후 바로 정산(배당 지급)까지 진행
 */
@Getter @Setter
public class VoteDetailResolveRequest {
    // 단일 정답 모드일 경우
    private Long correctChoiceId;

    // 옵션별 정답 모드일 경우
    private List<CorrectAnswer> answers;

    @Getter @Setter
    public static class CorrectAnswer {
        private Long optionId;
        private Long choiceId;
    }

    private Integer adminUserId; // 선택사항
}