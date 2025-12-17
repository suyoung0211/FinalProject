package org.usyj.makgora.article.controller;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.article.dto.response.ArticleAiTitleResponse;
import org.usyj.makgora.article.service.ArticleCategoryService;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class ArticleCategoryController {

    private final ArticleCategoryService articleCategoryService;

    /** 전체 카테고리 */
    @GetMapping
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(articleCategoryService.getAllCategories());
    }

    /** 카테고리별 기사 (비페이징) */
    @GetMapping("/{category}/articles")
    public ResponseEntity<List<ArticleAiTitleResponse>> getArticlesByCategory(
            @PathVariable String category
    ) {
        return ResponseEntity.ok(articleCategoryService.getArticlesByCategory(category));
    }

    /** 카테고리별 기사 수 통계 */
    @GetMapping("/stats")
    public ResponseEntity<?> getCategoryStats() {
        return ResponseEntity.ok(articleCategoryService.getCategoryStats());
    }

    /** 카테고리별 기사 (페이징) */
    @GetMapping("/{category}/paged")
    public Page<ArticleAiTitleResponse> getArticlesByCategoryPaged(
            @PathVariable String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return articleCategoryService.getArticlesByCategory(category, page, size);
    }
}