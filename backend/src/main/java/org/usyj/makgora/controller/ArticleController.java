package org.usyj.makgora.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import org.usyj.makgora.entity.ArticleAiTitleEntity;
import org.usyj.makgora.entity.ArticleCategoryEntity;
import org.usyj.makgora.entity.RssArticleEntity;

import org.usyj.makgora.request.article.ArticleCommentRequest;
import org.usyj.makgora.response.article.ArticleCommentResponse;
import org.usyj.makgora.response.article.ArticleReactionResponse;
import org.usyj.makgora.response.article.ArticleListResponse;   // ⭐ 추가됨

import org.usyj.makgora.rssfeed.repository.ArticleAiTitleRepository;
import org.usyj.makgora.rssfeed.repository.RssArticleRepository;

import org.usyj.makgora.security.CustomUserDetails;

import org.usyj.makgora.service.ArticleCommentService;
import org.usyj.makgora.service.ArticleReactionService;
import org.usyj.makgora.service.ArticleViewService;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleCommentService commentService;
    private final ArticleReactionService reactionService;
    private final ArticleViewService viewService;
    private final RssArticleRepository articleRepo;
    private final ArticleAiTitleRepository aiTitleRepo;

     @GetMapping
public ResponseEntity<?> getArticleList(
        @RequestParam(required = false) String category,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
) {
    Pageable pageable = PageRequest.of(page, size, Sort.by("publishedAt").descending());

    Page<RssArticleEntity> result;

    if (category == null || category.isBlank()) {
        // 전체 기사 페이징
        result = articleRepo.findAll(pageable);
    } else {
        // ✅ 이름 딱 이거 써야 함: findByCategoryName
        result = articleRepo.findByCategoryName(category, pageable);
    }

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
                .source(a.getFeed().getSourceName())      // ⚠ feed 엔티티 필드명에 맞게 수정
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

    /* ============================================================
       📌 1) 조회수 증가 (로그인 여부 상관 없음)
     ============================================================ */
    @PostMapping("/{articleId}/view")
    public ResponseEntity<?> addView(@PathVariable Integer articleId) {
        viewService.addView(articleId);  // Redis 증가 + 스코어 반영
        return ResponseEntity.ok("view_added");
    }

    /* ============================================================
       📌 2) 좋아요 / 싫어요 반응
     ============================================================ */
    @PostMapping("/{articleId}/like")
    public ResponseEntity<?> like(
            @PathVariable Integer articleId,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        if (user == null) return ResponseEntity.status(401).body("로그인이 필요합니다.");
        ArticleReactionResponse resp = reactionService.react(articleId, user.getId(), 1);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/{articleId}/dislike")
    public ResponseEntity<?> dislike(
            @PathVariable Integer articleId,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        if (user == null) return ResponseEntity.status(401).body("로그인이 필요합니다.");
        ArticleReactionResponse resp = reactionService.react(articleId, user.getId(), -1);
        return ResponseEntity.ok(resp);
    }

    /* ============================================================
       📌 3) 댓글 전체 조회
     ============================================================ */
    @GetMapping("/{articleId}/comments")
    public List<ArticleCommentResponse> getComments(
            @PathVariable Integer articleId,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        Integer currentUserId = (user != null) ? user.getId() : null;
        return commentService.getComments(articleId, currentUserId);
    }

    /* ============================================================
       📌 4) 댓글 작성
       parentCommentId == null → 일반 댓글
       parentCommentId != null → 대댓글
     ============================================================ */
    @PostMapping("/{articleId}/comments")
    public ResponseEntity<?> createComment(
            @PathVariable Integer articleId,
            @RequestBody ArticleCommentRequest request,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        if (user == null) return ResponseEntity.status(401).body("로그인이 필요합니다.");
        return ResponseEntity.ok(commentService.createComment(articleId, user.getId(), request));
    }

    /* ============================================================
       📌 5) 댓글 수정
     ============================================================ */
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<?> updateComment(
            @PathVariable Long commentId,
            @RequestBody ArticleCommentRequest request,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        if (user == null) return ResponseEntity.status(401).body("로그인이 필요합니다.");
        return ResponseEntity.ok(commentService.updateComment(commentId, user.getId(), request));
    }

    /* ============================================================
       📌 6) 댓글 삭제
     ============================================================ */
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
