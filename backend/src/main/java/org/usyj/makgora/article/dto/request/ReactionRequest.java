package org.usyj.makgora.article.dto.request;

import lombok.Getter;

@Getter
public class ReactionRequest {
    private int reaction;  // 1 = 좋아요, -1 = 싫어요, 0 = 취소
}