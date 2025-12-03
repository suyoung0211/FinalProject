package org.usyj.makgora.response.article;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ArticleReactionResponse {

    private Integer articleId;
    private Long likeCount;
    private Long dislikeCount;
    private Integer myReaction;  // 1 = 좋아요, -1 = 싫어요, 0 = 없음
}