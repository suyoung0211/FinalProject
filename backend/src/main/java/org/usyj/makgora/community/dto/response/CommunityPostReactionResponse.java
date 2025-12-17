package org.usyj.makgora.community.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 게시글 반응 응답 DTO
 * - 반응 처리 후 프론트에 돌려줄 최종 상태
 * - 프론트는 이 값들로 버튼 UI / 카운트 갱신
 */
@Getter
@AllArgsConstructor
public class CommunityPostReactionResponse {

    private Long postId;
    private Long recommendationCount; // 추천(좋아요) 수
    private Long dislikeCount;        // 비추천(싫어요) 수
    private Integer myReaction;          // 현재 유저의 반응 값 (1, -1, 0)
}
