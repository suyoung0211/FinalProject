package org.usyj.makgora.article.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ArticleCommentReactionResponse {
    private Long commentId;
    private long likeCount;     // ← int → long 변경
    private long dislikeCount;  // ← int → long 변경
    private boolean liked;
    private boolean disliked;
}
