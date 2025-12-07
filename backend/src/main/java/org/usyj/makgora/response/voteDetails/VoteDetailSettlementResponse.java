package org.usyj.makgora.response.voteDetails;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

/**
 * 🎯 VoteDetailSettlementResponse
 * - 정답 확정 + 정산 이후 결과 요약
 */
@Getter @Setter @Builder
public class VoteDetailSettlementResponse {

    private Integer voteId;
    private Integer correctChoiceId;

    private Integer totalPool;       // 전체 베팅 포인트 합
    private Integer winnerPool;      // 이긴 선택지에 걸린 포인트 합
    private Double  winnerOdds;      // 승자 배당률

    private Integer winnerCount;     // 이긴 사람 수
    private Integer distributedSum;  // 실제 지급된 포인트 총합
    private String resultSummary;
}
