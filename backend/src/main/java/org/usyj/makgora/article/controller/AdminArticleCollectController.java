package org.usyj.makgora.article.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.article.dto.response.ArticleCollectResponse;
import org.usyj.makgora.article.service.ArticleCollectByDBRssService;
import org.usyj.makgora.article.service.PythonAiTitleService;
import org.usyj.makgora.rssfeed.entity.RssFeedEntity;
import org.usyj.makgora.rssfeed.service.RssFeedInfoService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/admin/rss-feeds")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
@Slf4j
public class AdminArticleCollectController {

    private final ArticleCollectByDBRssService feedArticleService;
    private final PythonAiTitleService pythonAiTitleService;
    private final RssFeedInfoService rssFeedInfoService;

    /**
     * 단일 Feed 수집 + AI 제목 생성
     * POST /api/admin/rss-feeds/{feedId}/collect
     */
    @PostMapping("/{feedId}/collect")
    public ResponseEntity<ArticleCollectResponse> collectSingleFeed(
            @PathVariable Integer feedId
    ) {
        List<String> messages = new ArrayList<>();

        RssFeedEntity feed = rssFeedInfoService.getFeedEntity(feedId);

        if (feed.getStatus() != RssFeedEntity.Status.ACTIVE) {
            messages.add("⚠️ 비활성화된 피드 수집 시도입니다.");
            return ResponseEntity.ok(
                    new ArticleCollectResponse(0, 0, 0, messages)
            );
        }

        ArticleCollectByDBRssService.BatchResult result =
                feedArticleService.collectSingleFeed(feed);

        messages.add(String.format(
                "📌 기사 수집 완료 | 저장:%d | 스킵:%d | 전체:%d",
                result.saved(), result.skipped(), result.fetched()
        ));

        Map<String, Object> aiResponse =
                pythonAiTitleService.generateAiTitles();

        messages.add(String.format(
                "🤖 AI 제목 생성 완료 | 상태: %s",
                aiResponse.get("status")
        ));

        return ResponseEntity.ok(new ArticleCollectResponse(
                result.fetched(),
                result.saved(),
                result.skipped(),
                messages
        ));
    }

    /**
     * SourceName 기준 전체 수집
     * POST /api/admin/rss-feeds/collect/{sourceName}
     */
    @PostMapping("/collect/{sourceName}")
    public ResponseEntity<ArticleCollectResponse> collectBySource(
            @PathVariable String sourceName
    ) {
        ArticleCollectByDBRssService.BatchResult result =
                feedArticleService.collectFeedsBySourceName(sourceName);

        Map<String, Object> aiResponse =
                pythonAiTitleService.generateAiTitles();

        List<String> messages = List.of(
                String.format(
                        "🔥 '%s' 기사 수집 완료 | 저장:%d | 스킵:%d | 전체:%d",
                        sourceName, result.saved(), result.skipped(), result.fetched()
                ),
                String.format(
                        "🤖 AI 제목 생성 완료 | 상태: %s",
                        aiResponse.get("status")
                )
        );

        return ResponseEntity.ok(new ArticleCollectResponse(
                result.fetched(),
                result.saved(),
                result.skipped(),
                messages
        ));
    }

    /**
     * 전체 Feed 수집
     * POST /api/admin/rss-feeds/collect
     */
    @PostMapping("/collect")
    public ResponseEntity<ArticleCollectResponse> collectAllFeeds() {

        ArticleCollectByDBRssService.BatchResult result =
                feedArticleService.collectAllFeeds();

        Map<String, Object> aiResponse =
                pythonAiTitleService.generateAiTitles();

        List<String> messages = List.of(
                String.format(
                        "🔥 전체 기사 수집 완료 | 저장:%d | 스킵:%d | 전체:%d",
                        result.saved(), result.skipped(), result.fetched()
                ),
                String.format(
                        "🤖 AI 제목 생성 완료 | 상태: %s",
                        aiResponse.get("status")
                )
        );

        return ResponseEntity.ok(new ArticleCollectResponse(
                result.fetched(),
                result.saved(),
                result.skipped(),
                messages
        ));
    }
}