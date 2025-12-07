package org.usyj.makgora.response.article;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArticleCommentResponse {

    private Long commentId;
    private Integer articleId;

    private Long parentCommentId;

    private Integer userId;
    private String nickname;
    private String avatarIcon;
    private String profileFrame;

    private String content;

    private Long likeCount;
    private Long dislikeCount;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 로그인한 유저 기준
    private boolean mine;      // 내가 쓴 댓글
    private boolean liked;     // 내가 좋아요 눌렀는지
    private boolean disliked;  // 내가 싫어요 눌렀는지

    // 🔥 트리 구조 (대댓글)
    private List<ArticleCommentResponse> replies;
}
