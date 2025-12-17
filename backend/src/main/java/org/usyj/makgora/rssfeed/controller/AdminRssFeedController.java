package org.usyj.makgora.rssfeed.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.article.dto.response.ArticleResponse;
import org.usyj.makgora.rssfeed.dto.Categoryresponse;
import org.usyj.makgora.rssfeed.dto.RssFeedCreateRequest;
import org.usyj.makgora.rssfeed.dto.RssFeedUpdateRequest;
import org.usyj.makgora.rssfeed.service.RssFeedCreateService;
import org.usyj.makgora.rssfeed.service.RssFeedInfoService;
import org.usyj.makgora.rssfeed.service.RssFeedManagementService;
import org.usyj.makgora.rssfeed.service.RssFeedUpdateService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/admin/rss-feeds")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
@Slf4j
public class AdminRssFeedController {

    private final RssFeedInfoService rssFeedInfoService;
    private final RssFeedUpdateService rssFeedUpdateService;
    private final RssFeedCreateService rssFeedCreateService;
    private final RssFeedManagementService rssFeedManagementService;

    /**
     * RSS Feed 목록 조회
     * GET /api/admin/rss-feeds
     */
    @GetMapping
    public ResponseEntity<List<ArticleResponse>> getAllFeeds() {
        return ResponseEntity.ok(
                rssFeedInfoService.getAllFeedsWithArticleCount()
        );
    }

    /**
     * RSS Feed 수정
     * PUT /api/admin/rss-feeds/{feedId}
     */
    @PutMapping("/{feedId}")
    public ResponseEntity<ArticleResponse> updateFeed(
            @PathVariable Integer feedId,
            @RequestBody RssFeedUpdateRequest request
    ) {
        request.setId(feedId);
        return ResponseEntity.ok(
                rssFeedUpdateService.updateRssFeed(request)
        );
    }

    /**
     * RSS Feed 생성
     * POST /api/admin/rss-feeds
     */
    @PostMapping
    public ResponseEntity<Void> createFeed(@RequestBody RssFeedCreateRequest dto) {
        rssFeedCreateService.createFeed(dto);
        return ResponseEntity.ok().build();
    }

    /**
     * 카테고리 목록 조회
     * GET /api/admin/rss-feeds/categories
     */
    @GetMapping("/categories")
    public ResponseEntity<List<Categoryresponse>> getCategories() {
        return ResponseEntity.ok(
                rssFeedCreateService.getCategories()
        );
    }

    /**
     * RSS Feed 삭제
     * DELETE /api/admin/rss-feeds/{feedId}
     */
    @DeleteMapping("/{feedId}")
    public ResponseEntity<Void> deleteFeed(@PathVariable Integer feedId) {
        rssFeedManagementService.deleteFeed(feedId);
        log.info("RSS Feed 삭제 완료: feedId={}", feedId);
        return ResponseEntity.noContent().build();
    }
}
