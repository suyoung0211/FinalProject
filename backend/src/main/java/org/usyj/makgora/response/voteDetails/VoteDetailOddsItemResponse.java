package org.usyj.makgora.response.voteDetails;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

/**
 * 🎯 VoteDetailOddsItemResponse
 * 선택지 단위 배당률 정보를 담는 DTO.
 * - YES, NO, DRAW 각각 odds 계산 결과 포함
 */
@Getter @Setter @Builder
public class VoteDetailOddsItemResponse {

    private Integer optionId;
    private String text;
    private Double odds;
}