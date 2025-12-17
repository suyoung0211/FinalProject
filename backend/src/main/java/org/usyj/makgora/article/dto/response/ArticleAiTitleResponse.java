package org.usyj.makgora.article.dto.response;

import lombok.Builder;
import lombok.Getter;

import org.usyj.makgora.article.entity.ArticleCategoryEntity;
import org.usyj.makgora.article.entity.RssArticleEntity;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class ArticleAiTitleResponse {

    private Long articleId;
    private String title;
    private String aiTitle;
    private String thumbnail;
    private LocalDateTime publishedAt;
    private List<String> categories;

    public static ArticleAiTitleResponse fromEntity(RssArticleEntity a, String aiTitle) {
        return ArticleAiTitleResponse.builder()
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