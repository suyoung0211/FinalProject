package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.usyj.makgora.entity.ArticleAiTitleEntity;
import org.usyj.makgora.entity.ArticleCategoryEntity;
import org.usyj.makgora.entity.RssArticleEntity;
import org.usyj.makgora.repository.ArticleRepository;
import org.usyj.makgora.rssfeed.repository.ArticleAiTitleRepository;
import org.usyj.makgora.rssfeed.repository.ArticleCategoryRepository;
import org.usyj.makgora.response.article.ArticleResponse;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ArticleCategoryService {

    private final ArticleCategoryRepository categoryRepo;
    private final ArticleRepository listRepo;
    private final ArticleAiTitleRepository aiTitleRepo;

    /** 전체 카테고리 목록 */
    public List<String> getAllCategories() {
        return categoryRepo.findAll().stream()
                .map(ArticleCategoryEntity::getName)
                .sorted()
                .toList();
    }

    /** 카테고리별 기사 조회 (AI 제목 포함, 비페이징) */
    public List<ArticleResponse> getArticlesByCategory(String category) {

        List<RssArticleEntity> list = listRepo.findAllByCategoryName(category);

        return list.stream()
                .map(article -> {

                    // aiTitleRepo가 List<ArticleAiTitleEntity> 반환하는 구조임
                    String aiTitle = aiTitleRepo.findByArticle(article)
                            .stream()
                            .findFirst()
                            .map(ArticleAiTitleEntity::getAiTitle)
                            .orElse(null);

                    return ArticleResponse.fromEntity(article, aiTitle);
                })
                .toList();
    }

    /** 카테고리별 기사 조회 (페이징) */
    public Page<ArticleResponse> getArticlesByCategory(String category, int page, int size) {

        Pageable pageable = PageRequest.of(page, size);

        Page<RssArticleEntity> list = listRepo.findByCategoryPaged(category, pageable);

        return list.map(article -> {

            String aiTitle = aiTitleRepo.findByArticle(article)
                    .stream()
                    .findFirst()
                    .map(ArticleAiTitleEntity::getAiTitle)
                    .orElse(null);

            return ArticleResponse.fromEntity(article, aiTitle);
        });
    }

    /** 카테고리 통계 */
    public List<Map<String, Object>> getCategoryStats() {
        return categoryRepo.findAll().stream()
                .map(cat -> {
                    int count = listRepo.findAllByCategoryName(cat.getName()).size();
                    Map<String, Object> map = new HashMap<>();
                    map.put("category", cat.getName());
                    map.put("count", count);
                    return map;
                })
                .toList();
    }
}
