package org.usyj.makgora.response.voteDetails;

import lombok.Builder;
import lombok.Data;

/**
 * 🎯 VoteDetailChoiceResponse
 * 옵션 내부의 개별 선택지(YES/NO/DRAW)에 대한 정보.
 * - 참여자수, 포인트량, 퍼센트 등을 포함
 */
@Data @Builder
public class VoteDetailChoiceResponse {

    private Integer choiceId;
    private String text;

    private Integer participantsCount;   // 선택지 참여 숫자
    private Long pointsTotal;            // 베팅 총합

    private Double odds;                // 배당률
    private Double percent;             // 퍼센트(YES/NO 비율)
    // ✅ option 기준 정답 여부
    private Boolean isCorrect;
    // 내가 이 선택지에 베팅했는지 여부
    private Boolean isMyChoice;
    // 실시간 퍼센티지 외에 “시장 점유율”
    private Double marketShare;
}
