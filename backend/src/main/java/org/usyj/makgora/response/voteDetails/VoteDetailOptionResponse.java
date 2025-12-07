package org.usyj.makgora.response.voteDetails;

import java.util.List;

import org.usyj.makgora.response.voteDetails.VoteDetailStatisticsResponse.OptionTrendItem;

import lombok.Builder;
import lombok.Data;

/**
 * 🎯 VoteDetailOptionResponse
 * 투표 내 옵션(option) 단위 시장을 구성하는 DTO.
 * - 각 옵션은 YES/NO/DRAW 단위 선택지를 포함한다.
 */
@Data @Builder
public class VoteDetailOptionResponse {

    private Integer optionId;
    private String title;

    private Integer totalParticipants;   // 옵션 단위 참여자 수
    private Long totalPoints;            // 옵션 단위 베팅 포인트 총합

    private List<VoteDetailChoiceResponse> choices;
    private List<OptionTrendItem> trend;
}