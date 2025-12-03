package org.usyj.makgora.rssfeed.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.rssfeed.dto.RssFeedUpdateRequest;
import org.usyj.makgora.rssfeed.dto.RssFeedResponse;
import org.usyj.makgora.rssfeed.service.RssFeedInfoService;
import org.usyj.makgora.rssfeed.service.RssFeedUpdateService;

import java.util.List;

@RestController
@RequestMapping("/api/admin/rss-feeds")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
public class AdminRssFeedController {

    private final RssFeedInfoService rssFeedInfoService;
    private final RssFeedUpdateService rssFeedUpdateService; // ⭐ 수정 전용 서비스 주입

    /**
     * RSS Feed 목록 조회
     * GET /api/admin/rss-feeds
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
}
