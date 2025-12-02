package org.usyj.makgora.response.article;

import lombok.Builder;
import lombok.Getter;
import org.usyj.makgora.entity.ArticleCategoryEntity;
import org.usyj.makgora.entity.RssArticleEntity;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class ArticleResponse {

    private Long articleId;
    private String title;
    private String aiTitle;
    private String thumbnail;
    private LocalDateTime publishedAt;
    private List<String> categories;

    public static ArticleResponse fromEntity(RssArticleEntity a, String aiTitle) {
        return ArticleResponse.builder()
                .articleId(a.getId().longValue())
                .title(a.getTitle())
                .aiTitle(aiTitle)
                .thumbnail(a.getThumbnailUrl())
                .publishedAt(a.getPublishedAt())
                .categories(
                        a.getCategories().stream()
                                .map(ArticleCategoryEntity::getName)
                                .toList()
                )
                .build();
    }
}