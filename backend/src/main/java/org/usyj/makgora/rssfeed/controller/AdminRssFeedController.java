package org.usyj.makgora.rssfeed.controller;


import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.rssfeed.dto.RssFeedResponse;
import org.usyj.makgora.rssfeed.service.RssFeedInfoService;

import java.util.List;

@RestController
@RequestMapping("/api/admin/rss-feeds")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
public class AdminRssFeedController {

    private final RssFeedInfoService rssFeedInfoService;

    /**
     * 프론트 테이블용 RSS Feed 목록 조회
     * GET /api/rss-feeds
     */
    @GetMapping
    public ResponseEntity<List<RssFeedResponse>> getAllFeeds() {
        List<RssFeedResponse> feeds = rssFeedInfoService.getAllFeedsWithArticleCount();
        return ResponseEntity.ok(feeds);
    }

    /**
     * RSS Feed 수정
     * PUT /api/admin/rss-feeds/{feedId}
     */
    @PutMapping("/{feedId}")
    public ResponseEntity<RssFeedResponse> updateFeed(
            @PathVariable Integer feedId,
            @RequestBody RssFeedUpdateRequest request
    ) {
        request.setId(feedId); // ⭐ PathVariable → DTO에 주입

        RssFeedResponse updatedFeed = rssFeedUpdateService.updateRssFeed(request);

        return ResponseEntity.ok(updatedFeed);
    }

    /**
     * 카테고리 목록조회
     * PUT /api/admin/rss-feeds/categories
     */
    @GetMapping("/categories")
    public ResponseEntity<List<Categoryresponse>> getCategories() {
        return ResponseEntity.ok(rssFeedCreateService.getCategories());
    }

    /**
     * RSS 피드 추가
     * PUT /api/admin/rss-feeds
     */
    @PostMapping
    public ResponseEntity<Void> createFeed(@RequestBody RssFeedCreateRequest dto) {
        rssFeedCreateService.createFeed(dto);
        return ResponseEntity.ok().build();
    }
}