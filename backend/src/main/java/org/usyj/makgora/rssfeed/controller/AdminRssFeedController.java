package org.usyj.makgora.rssfeed.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.usyj.makgora.entity.RssFeedEntity;
import org.usyj.makgora.rssfeed.dto.Categoryresponse;
import org.usyj.makgora.rssfeed.dto.CollectResponse;
import org.usyj.makgora.rssfeed.dto.RssFeedCreateRequest;
import org.usyj.makgora.rssfeed.dto.RssFeedResponse;
import org.usyj.makgora.rssfeed.dto.RssFeedUpdateRequest;
import org.usyj.makgora.rssfeed.service.FeedArticleService;
import org.usyj.makgora.rssfeed.service.PythonAiTitleService;
import org.usyj.makgora.rssfeed.service.RssFeedCreateService;
import org.usyj.makgora.rssfeed.service.RssFeedInfoService;
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
    private final FeedArticleService feedArticleService;    // ⭐ RSS 기사 수집 서비스 주입
    private final PythonAiTitleService pythonAiTitleService;

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
     * 🚀 단일 Feed 수집 + AI 제목 생성
     * - POST /{feedId}/collect
     * - Feed 수집 후 Python AI 제목 생성 호출
     */
    @PostMapping("/{feedId}/collect")
    public ResponseEntity<CollectResponse> collectSingleFeed(@PathVariable Integer feedId) {

        // 1️⃣ Feed 정보 조회
        RssFeedEntity feed = rssFeedInfoService.getFeedEntity(feedId);

        if (feed.getStatus() != RssFeedEntity.Status.ACTIVE) {
            CollectResponse response = new CollectResponse(
                    0, 0, 0,
                    List.of("⚠️ 비활성화된 피드 수집 시도입니다.") // 🔹 메시지를 리스트로 변경
            );
            return ResponseEntity.ok(response);
        }

        // 2️⃣ Feed 수집
        FeedArticleService.BatchResult result = feedArticleService.collectSingleFeed(feed);

        // 🔹 기사 수집 완료 로그
        log.info("📌 기사 수집 완료 | 저장:{} | 스킵:{} | 전체:{}",
                result.saved(), result.skipped(), result.fetched());

        // 3️⃣ AI 제목 생성 호출
        Map<String, Object> aiResponse = pythonAiTitleService.generateAiTitles();

        // 🔹 AI 제목 생성 완료 로그
        log.info("🤖 AI 제목 생성 완료 | 상태: {}", aiResponse.get("status"));

        // 4️⃣ 메시지 처리 (두 단계 메시지)
        List<String> messages = new ArrayList<>();

        if (result.fetched() == 0 && result.saved() == 0 && result.skipped() == 0) {
            messages.add("❌ URL 형식 오류 또는 접근 불가");
        } else {
            messages.add(String.format("📌 기사 수집 완료 | 저장:%d | 스킵:%d | 전체:%d",
                    result.saved(), result.skipped(), result.fetched()));
        }

        messages.add(String.format("🤖 AI 제목 생성 완료 | 상태: %s", aiResponse.get("status")));

        CollectResponse response = new CollectResponse(
                result.fetched(),
                result.saved(),
                result.skipped(),
                messages // 🔹 리스트 형태로 전달
        );

        return ResponseEntity.ok(response);
    }

    /**
     * 🚀 SourceName 기준 Feed 전체 수집 + AI 제목 생성
     * - POST /collect/{sourceName}
     * - sourceName과 일치하는 활성화된 피드 수집 후 AI 제목 생성
     */
    @PostMapping("/collect/{sourceName}")
    public ResponseEntity<CollectResponse> collectFeedsBySourceName(@PathVariable String sourceName) {

        // 1️⃣ Feed 수집
        FeedArticleService.BatchResult result = feedArticleService.collectFeedsBySourceName(sourceName);

        // 🔹 기사 수집 완료 로그
        log.info("📌 '{}' 기준 기사 수집 완료 | 저장:{} | 스킵:{} | 전체:{}",
                sourceName, result.saved(), result.skipped(), result.fetched());

        // 2️⃣ AI 제목 생성 호출
        Map<String, Object> aiResponse = pythonAiTitleService.generateAiTitles();

        // 🔹 AI 제목 생성 완료 로그
        log.info("🤖 AI 제목 생성 완료 | 상태: {}", aiResponse.get("status"));

        // 3️⃣ 메시지 처리 (리스트 형태)
        List<String> messages = new ArrayList<>();
        if (result.fetched() == 0 && result.saved() == 0 && result.skipped() == 0) {
            messages.add("⚠️ 활성화된 피드가 없거나 URL 형식 오류");
        } else {
            messages.add(String.format("🔥 '%s' 기사 수집 완료 | 저장:%d | 스킵:%d | 전체:%d",
                    sourceName, result.saved(), result.skipped(), result.fetched()));
            messages.add(String.format("🤖 AI 제목 생성 완료 | 상태: %s", aiResponse.get("status")));
        }

        return ResponseEntity.ok(new CollectResponse(
                result.fetched(), result.saved(), result.skipped(), messages));
    }

    /**
     * 🚀 전체 Feed 수집 + AI 제목 생성
     * - POST /collect
     * - 전체 활성화된 피드 수집 후 AI 제목 생성
     */
    @PostMapping("/collect")
    public ResponseEntity<CollectResponse> collectAllFeeds() {

        // 1️⃣ Feed 수집
        FeedArticleService.BatchResult result = feedArticleService.collectAllFeeds();

        // 🔹 기사 수집 완료 로그
        log.info("📌 전체 기사 수집 완료 | 저장:{} | 스킵:{} | 전체:{}",
                result.saved(), result.skipped(), result.fetched());

        // 2️⃣ AI 제목 생성 호출
        Map<String, Object> aiResponse = pythonAiTitleService.generateAiTitles();

        // 🔹 AI 제목 생성 완료 로그
        log.info("🤖 AI 제목 생성 완료 | 상태: {}", aiResponse.get("status"));

        // 3️⃣ 메시지 처리 (리스트 형태)
        List<String> messages = new ArrayList<>();
        if (result.fetched() == 0 && result.saved() == 0 && result.skipped() == 0) {
            messages.add("⚠️ 활성화된 피드가 없거나 URL 형식 오류");
        } else {
            messages.add(String.format("🔥 전체 기사 수집 완료 | 저장:%d | 스킵:%d | 전체:%d",
                    result.saved(), result.skipped(), result.fetched()));
            messages.add(String.format("🤖 AI 제목 생성 완료 | 상태: %s", aiResponse.get("status")));
        }

        return ResponseEntity.ok(new CollectResponse(
                result.fetched(), result.saved(), result.skipped(), messages));
    }
}
