package org.usyj.makgora.article.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArticleCommentRequest {

    /** 댓글 내용 */
    private String content;

    /**
     * 부모 댓글 ID
     * - null  이면 루트 댓글
     * - not null 이면 대댓글
     */
    private Long parentCommentId;
}