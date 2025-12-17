package org.usyj.makgora.article.controller;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.usyj.makgora.article.dto.request.ArticleCommentRequest;
import org.usyj.makgora.article.dto.response.ArticleCommentResponse;
import org.usyj.makgora.article.dto.response.ArticleDetailResponse;
import org.usyj.makgora.article.dto.response.ArticleListResponse;
import org.usyj.makgora.article.entity.ArticleAiTitleEntity;
import org.usyj.makgora.article.entity.ArticleCategoryEntity;
import org.usyj.makgora.article.entity.RssArticleEntity;
import org.usyj.makgora.article.repository.ArticleAiTitleRepository;
import org.usyj.makgora.article.repository.ArticleRepository;
import org.usyj.makgora.article.service.ArticleCommentService;
import org.usyj.makgora.article.service.ArticleDetailService;
import org.usyj.makgora.article.service.ArticleViewService;
import org.usyj.makgora.global.security.CustomUserDetails;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleCommentController {

    private final ArticleCommentService commentService;
    private final ArticleViewService viewService;
    private final ArticleRepository articleRepo;
    private final ArticleAiTitleRepository aiTitleRepo;
    private final ArticleDetailService articleDetailService;

    /* ================================
       📌 기사 목록
       ================================ */
    @GetMapping
    public ResponseEntity<?> getArticleList(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("publishedAt").descending());

        Page<RssArticleEntity> result =
                (category == null || category.isBlank())
                        ? articleRepo.findAll(pageable)
                        : articleRepo.findByCategoryPaged(category, pageable);

        Page<ArticleListResponse> mapped = result.map(a -> {
            ArticleAiTitleEntity ai = aiTitleRepo.findByArticle_Id(a.getId());

            String summary = "";
            if (a.getContent() != null && !a.getContent().isBlank()) {
                String content = a.getContent();
                summary = content.substring(0, Math.min(120, content.length())) + "...";
            }

            return ArticleListResponse.builder()
                    .id(a.getId())
                    .title(ai != null && ai.getAiTitle() != null ? ai.getAiTitle() : a.getTitle())
                    .summary(summary)
                    .source(a.getFeed().getSourceName())
                    .timeAgo(formatTimeAgo(a.getPublishedAt()))
                    .image(a.getThumbnailUrl())
                    .category(
                            a.getCategories().stream()
                                    .findFirst()
                                    .map(ArticleCategoryEntity::getName)
                                    .orElse("기타")
                    )
                    .build();
        });

        return ResponseEntity.ok(mapped);
    }

    private String formatTimeAgo(LocalDateTime time) {
        Duration diff = Duration.between(time, LocalDateTime.now());
        long minutes = diff.toMinutes();
        long hours = diff.toHours();
        long days = diff.toDays();
        if (minutes < 60) return minutes + "분 전";
        if (hours < 24) return hours + "시간 전";
        return days + "일 전";
    }

    /* ================================
       📌 기사 상세
       ================================ */
    @GetMapping("/{articleId}")
    public ResponseEntity<ArticleDetailResponse> getArticleDetail(
            @PathVariable Integer articleId,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        Integer userId = (user != null) ? user.getId() : null;

        ArticleDetailResponse resp = articleDetailService.getArticleDetail(articleId, userId);

        // 들어올 때 조회수 증가
        viewService.addView(articleId);
        System.out.println("CurrentUserId = " + userId);
        System.out.println("UserEntityId = " + (user != null ? user.getUser().getId() : null));


        return ResponseEntity.ok(resp);
    }

    /* ================================
       📌 조회수 증가 (별도 호출용)
       ================================ */
    @PostMapping("/{articleId}/view")
    public ResponseEntity<?> addView(@PathVariable Integer articleId) {
        viewService.addView(articleId);
        return ResponseEntity.ok("view_added");
    }

    /* ================================
       📌 댓글 조회
       ================================ */
    @GetMapping("/{articleId}/comments")
    public List<ArticleCommentResponse> getComments(
            @PathVariable Integer articleId,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        Integer currentUserId = (user != null) ? user.getId() : null;
        return commentService.getComments(articleId, currentUserId);
    }

    /* ================================
       📌 댓글 작성
       ================================ */
    @PostMapping("/{articleId}/comments")
    public ResponseEntity<?> createComment(
            @PathVariable Integer articleId,
            @RequestBody ArticleCommentRequest request,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        if (user == null) return ResponseEntity.status(401).body("로그인이 필요합니다.");
        return ResponseEntity.ok(commentService.createComment(articleId, user.getId(), request));
    }

    /* ================================
       📌 댓글 수정
       ================================ */
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<?> updateComment(
            @PathVariable Long commentId,
            @RequestBody ArticleCommentRequest request,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        if (user == null) return ResponseEntity.status(401).body("로그인이 필요합니다.");
        return ResponseEntity.ok(commentService.updateComment(commentId, user.getId(), request));
    }

    /* ================================
       📌 댓글 삭제
       ================================ */
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<?> deleteComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        if (user == null) return ResponseEntity.status(401).body("로그인이 필요합니다.");
        commentService.deleteComment(commentId, user.getId());
        return ResponseEntity.ok("comment_deleted");
    }
}