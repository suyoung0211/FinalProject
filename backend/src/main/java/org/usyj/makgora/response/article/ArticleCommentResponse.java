package org.usyj.makgora.response.article;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ArticleCommentResponse {

    private Long commentId;
    private Integer articleId;
    private Long parentCommentId;

    private Integer userId;
    private String nickname;

    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private int likeCount;
    private int dislikeCount;

    private boolean mine; // 현재 로그인 유저가 쓴 댓글인지 여부

    // 대댓글 목록
    private List<ArticleCommentResponse> replies;
}