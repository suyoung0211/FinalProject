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
@Data
@Builder
public class VoteDetailOptionResponse {

    private Integer optionId;
    private String title;

    // 옵션 단위 집계
    private Integer totalParticipants;
    private Long totalPoints;

    // 옵션 단위 정답 choice
    private Integer correctChoiceId;

    // YES / NO / DRAW
    private List<VoteDetailChoiceResponse> choices;

    // 옵션 기준 트렌드
    private List<VoteDetailStatisticsResponse.OptionTrendItem> trend;
}
