package org.usyj.makgora.article.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.usyj.makgora.article.dto.response.ArticleAiTitleResponse;
import org.usyj.makgora.article.entity.ArticleCategoryEntity;
import org.usyj.makgora.article.entity.RssArticleEntity;
import org.usyj.makgora.article.repository.ArticleAiTitleRepository;
import org.usyj.makgora.article.repository.ArticleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ArticleListService {

    private final ArticleRepository articleQueryRepo;
    private final ArticleAiTitleRepository aiRepo;
    private final ArticleRepository listRepo;

    public List<ArticleAiTitleResponse> getLatestArticles() {

        return articleQueryRepo.findTop20ByOrderByPublishedAtDesc()
                .stream()
                .map(a -> {
                    var ai = aiRepo.findByArticle_Id(a.getId());
                    return ArticleAiTitleResponse.builder()
                            .articleId(a.getId().longValue())
                            .title(a.getTitle())
                            .aiTitle(ai != null ? ai.getAiTitle() : null)
                            .thumbnail(a.getThumbnailUrl())
                            .publishedAt(a.getPublishedAt())
                            .categories(
                                    a.getCategories().stream()
                                            .map(ArticleCategoryEntity::getName)
                                            .toList()
                            )
                            .build();
                })
                .toList();
    }

    public List<ArticleAiTitleResponse> getArticlesByCategory(String category) {

        return articleQueryRepo.findAllByCategoryName(category)
                .stream()
                .map(a -> {
                    var ai = aiRepo.findByArticle_Id(a.getId());
                    return ArticleAiTitleResponse.builder()
                            .articleId(a.getId().longValue())
                            .title(a.getTitle())
                            .aiTitle(ai != null ? ai.getAiTitle() : null)
                            .thumbnail(a.getThumbnailUrl())
                            .publishedAt(a.getPublishedAt())
                            .categories(
                                    a.getCategories().stream()
                                            .map(ArticleCategoryEntity::getName)
                                            .toList()
                            )
                            .build();
                })
                .toList();
    }

    public Page<ArticleAiTitleResponse> getArticlesByCategory(String category, int page, int size) {

        Pageable pageable = PageRequest.of(page, size);

        Page<RssArticleEntity> list = listRepo.findByCategoryPaged(category, pageable);

        return list.map(a -> {
            var ai = aiRepo.findByArticle_Id(a.getId());

            return ArticleAiTitleResponse.builder()
                    .articleId(a.getId().longValue())
                    .title(a.getTitle())
                    .aiTitle(ai != null ? ai.getAiTitle() : null)
                    .thumbnail(a.getThumbnailUrl())
                    .publishedAt(a.getPublishedAt())
                    .categories(
                            a.getCategories().stream()
                                    .map(ArticleCategoryEntity::getName)
                                    .toList()
                    )
                    .build();
        });
    }
}