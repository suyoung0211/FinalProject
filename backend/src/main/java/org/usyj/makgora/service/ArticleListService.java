package org.usyj.makgora.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.usyj.makgora.entity.ArticleCategoryEntity;
import org.usyj.makgora.entity.RssArticleEntity;
import org.usyj.makgora.repository.ArticleListRepository;
import org.usyj.makgora.response.article.ArticleResponse;
import org.usyj.makgora.rssfeed.repository.ArticleAiTitleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ArticleListService {

    private final ArticleListRepository articleQueryRepo;
    private final ArticleAiTitleRepository aiRepo;
    private final ArticleListRepository listRepo;

    public List<ArticleResponse> getLatestArticles() {

        return articleQueryRepo.findTop20ByOrderByPublishedAtDesc()
                .stream()
                .map(a -> {
                    var ai = aiRepo.findByArticle_Id(a.getId());
                    return ArticleResponse.builder()
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

    public List<ArticleResponse> getArticlesByCategory(String category) {

        return articleQueryRepo.findAllByCategoryName(category)
                .stream()
                .map(a -> {
                    var ai = aiRepo.findByArticle_Id(a.getId());
                    return ArticleResponse.builder()
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

    public Page<ArticleResponse> getArticlesByCategory(String category, int page, int size) {

        Pageable pageable = PageRequest.of(page, size);

        Page<RssArticleEntity> list = listRepo.findByCategoryPaged(category, pageable);

        return list.map(a -> {
            var ai = aiRepo.findByArticle_Id(a.getId());

            return ArticleResponse.builder()
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