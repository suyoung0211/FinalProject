package org.usyj.makgora.response.article;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArticleDetailResponse {

    private Integer articleId;
    private String title;
    private String aiTitle;
    private String originalTitle;
    private String publisher;
    private String content;
    private String thumbnailUrl;
    private String link;

    private LocalDateTime createdAt;
    private LocalDateTime publishedAt;

    private List<CategoryDto> categories;

    private Long viewCount;
    private Long likeCount;
    private Long dislikeCount;
    private Long commentCount;
    private Long aiSystemScore;
    private Integer userReaction;

    private boolean liked;
    private boolean disliked;

    private Integer connectedVoteId;   // 해당 기사로 만든 투표 ID (없으면 null)
    private String connectedVoteStatus; // ONGOING, FINISHED, CANCELLED

    // 🔥 댓글 통합 DTO 사용
    private List<ArticleCommentResponse> comments;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CategoryDto {
        private Integer categoryId;
        private String name;
    }
}
