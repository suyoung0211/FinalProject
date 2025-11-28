package org.usyj.makgora.community.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 게시글 반응 요청 DTO
 * - 프론트에서 어떤 반응을 할 건지 서버로 전달할 때 사용
 * - reactionValue: 1 = 추천(좋아요), -1 = 비추천(싫어요), 0 = 반응 취소
 */
@Getter
@NoArgsConstructor
public class CommunityPostReactionRequest {

    @NotNull
    private Integer reactionValue;
}
