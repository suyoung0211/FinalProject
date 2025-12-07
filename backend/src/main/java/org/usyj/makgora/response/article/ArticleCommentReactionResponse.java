package org.usyj.makgora.response.article;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
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
