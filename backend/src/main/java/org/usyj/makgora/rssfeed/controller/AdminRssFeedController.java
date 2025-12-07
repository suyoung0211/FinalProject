package org.usyj.makgora.rssfeed.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.rssfeed.dto.Categoryresponse;
import org.usyj.makgora.rssfeed.dto.CollectResponse;
import org.usyj.makgora.rssfeed.dto.RssFeedCreateRequest;
import org.usyj.makgora.rssfeed.dto.RssFeedResponse;
import org.usyj.makgora.rssfeed.dto.RssFeedUpdateRequest;
import org.usyj.makgora.rssfeed.repository.RssFeedRepository;
import org.usyj.makgora.rssfeed.service.RssFeedInfoService;
import org.usyj.makgora.rssfeed.service.RssFeedCreateService;
import org.usyj.makgora.rssfeed.service.RssFeedUpdateService;
import org.usyj.makgora.rssfeed.service.FeedArticleService;
import org.usyj.makgora.entity.RssFeedEntity;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/rss-feeds")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
public class AdminRssFeedController {

    private final RssFeedInfoService rssFeedInfoService;     
    private final RssFeedUpdateService rssFeedUpdateService; 
    private final RssFeedCreateService rssFeedCreateService;
    private final FeedArticleService feedArticleService;    // ⭐ RSS 기사 수집 서비스 주입
    private final RssFeedRepository feedRepo;

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
        request.setId(feedId);
        RssFeedResponse updatedFeed = rssFeedUpdateService.updateRssFeed(request);
        return ResponseEntity.ok(updatedFeed);
    }

    /**
     * 카테고리 목록조회
     * GET /api/admin/rss-feeds/categories
     */
    @GetMapping("/categories")
    public ResponseEntity<List<Categoryresponse>> getCategories() {
        return ResponseEntity.ok(rssFeedCreateService.getCategories());
    }

    /**
     * RSS 피드 추가
     * POST /api/admin/rss-feeds
     */
    @PostMapping
    public ResponseEntity<Void> createFeed(@RequestBody RssFeedCreateRequest dto) {
        rssFeedCreateService.createFeed(dto);
        return ResponseEntity.ok().build();
    }

    /**
     * 🚀 단일 Feed 수집
     * - 기존 문자열 응답 → BatchResult JSON 반환
     */
    @PostMapping("/{feedId}/collect")
    public ResponseEntity<CollectResponse> collectSingleFeed(@PathVariable Integer feedId) {

        // 1️⃣ Feed 정보 조회
        RssFeedEntity feed = rssFeedInfoService.getFeedEntity(feedId);

        // 🔹 0) 비활성화 피드 체크
        if (feed.getStatus() != RssFeedEntity.Status.ACTIVE) {
            CollectResponse response = new CollectResponse(
                    0, 0, 0,
                    "⚠️ 비활성화된 피드 수집 시도입니다."
            );
            return ResponseEntity.ok(response);
        }

        // 2️⃣ Feed 수집
        FeedArticleService.BatchResult result = feedArticleService.collectSingleFeed(feed);

        // 3️⃣ 메시지 처리
        String message;
        if (result.fetched() == 0 && result.saved() == 0 && result.skipped() == 0) {
            message = "❌ URL 형식 오류 또는 접근 불가";
        } else {
            message = String.format("📌 단일 수집 완료 | 저장:%d | 스킵:%d | 전체:%d",
                    result.saved(), result.skipped(), result.fetched());
        }

        CollectResponse response = new CollectResponse(
                result.fetched(),
                result.saved(),
                result.skipped(),
                message
        );

        return ResponseEntity.ok(response);
    }

    /**
     * 🚀 특정 SourceName 활성화 피드 전체 수집
     * - POST /api/admin/rss-feeds/collect/{sourceName}
     * - 전달받은 sourceName과 일치하는 활성화된 피드만 수집
     * - BatchResult JSON 반환
     */
    @PostMapping("/collect/{sourceName}")
    public ResponseEntity<CollectResponse> collectFeedsBySourceName(
            @PathVariable String sourceName) {

        FeedArticleService.BatchResult result = feedArticleService.collectFeedsBySourceName(sourceName);

        String message;
        if (result.fetched() == 0 && result.saved() == 0 && result.skipped() == 0) {
            message = "⚠️ 활성화된 피드가 없거나 URL 형식 오류";
        } else {
            message = String.format("🔥 '%s' 수집 완료 | 저장:%d | 스킵:%d | 전체:%d",
                    sourceName, result.saved(), result.skipped(), result.fetched());
        }

        return ResponseEntity.ok(new CollectResponse(
                result.fetched(), result.saved(), result.skipped(), message));
    }


    /**
     * 🚀 전체 Feed 수집
     * - 기존 문자열 응답 → BatchResult JSON 반환
     */
    @PostMapping("/collect")
    public ResponseEntity<CollectResponse> collectAllFeeds() {

        FeedArticleService.BatchResult result = feedArticleService.collectAllFeeds();

        String message;
        if (result.fetched() == 0 && result.saved() == 0 && result.skipped() == 0) {
            message = "⚠️ 활성화된 피드가 없거나 URL 형식 오류";
        } else {
            message = String.format("🔥 전체 수집 완료 | 저장:%d | 스킵:%d | 전체:%d",
                    result.saved(), result.skipped(), result.fetched());
        }

        return ResponseEntity.ok(new CollectResponse(
                result.fetched(), result.saved(), result.skipped(), message));
    }

    /**
     * 🔹 슈퍼 어드민 전용 피드 삭제
     * - 하드 딜리트
     */
    @DeleteMapping("/{feedId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')") // 슈퍼 어드민만 접근 가능
    public ResponseEntity<String> deleteFeed(@PathVariable Integer feedId) {
        return feedRepo.findById(feedId)
                .map(feed -> {
                    feedRepo.delete(feed); // 하드 딜리트
                    return ResponseEntity.ok("피드 삭제 완료: " + feed.getSourceName());
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("피드를 찾을 수 없습니다."));
    }
}
