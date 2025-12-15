package org.usyj.makgora.rssfeed.service;

import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.ArticleCategoryEntity;
import org.usyj.makgora.entity.RssArticleEntity;
import org.usyj.makgora.entity.RssFeedEntity;
import org.usyj.makgora.rssfeed.dto.RssArticleCreateDTO;
import org.usyj.makgora.rssfeed.repository.RssArticleRepository;

import com.rometools.rome.feed.synd.SyndEntry;
import com.rometools.rome.feed.synd.SyndFeed;
import com.rometools.rome.io.SyndFeedInput;
import com.rometools.rome.io.XmlReader;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 🔹 FeedArticleService
 * - DB 기반 직접 수집 버전
 * - SourceRegistry 없이 DB URL로 직접 RSS/Atom 피드 파싱
 * - Rome 라이브러리로 표준 피드 파싱 후 RssArticleCreateDTO 변환하여 저장
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FeedArticleService {

    private final RssArticleRepository articleRepo;
    private final RssFeedManagementService feedService;

    /**
     * 🔹 배치 저장 통계 객체
     * fetched: 파싱된 엔트리 수
     * saved: DB에 저장된 수
     * skipped: 중복 등으로 저장 안된 수
     */
    public record BatchResult(int fetched, int saved, int skipped) {}

    /**
     * 🔹 기사 배치 저장
     * - DTO 리스트를 받아 DB에 저장
     * - 중복 링크 검사 포함
     * - DTO 카테고리가 비어있으면 feed 기본 카테고리 사용
     */
    @Transactional
    public BatchResult saveArticlesBatch(RssFeedEntity feed, List<RssArticleCreateDTO> dtos) {

        int fetched = dtos.size();
        int saved = 0;
        int skipped = 0;

        Set<String> savedLinks = new HashSet<>();

        for (RssArticleCreateDTO dto : dtos) {

            // 🔹 publishedAt 이 null이면 저장 스킵
            if (dto.getPublishedAt() == null) {
                // publishedAt 없는 데이터는 기사로 저장되지 않도록 제외
                skipped++;
                continue;
            }

            // 중복 링크 검사
            if (articleRepo.existsByLink(dto.getLink()) || savedLinks.contains(dto.getLink())) {
                skipped++;
                continue;
            }

            // 🔹 자동 생성 없이, 존재하는 카테고리만 사용
            Set<ArticleCategoryEntity> categories;

            if (dto.getCategories() != null && !dto.getCategories().isEmpty()) {
                // feedService에 자동 생성 로직 대신, 존재하는 카테고리만 가져오는 메서드 사용
                categories = feedService.getExistingCategories(new HashSet<>(dto.getCategories()));
            } else {
                categories = new HashSet<>(feed.getCategories());
            }

            // 엔티티 생성 후 저장
            RssArticleEntity article = RssArticleEntity.builder()
                    .feed(feed)
                    .title(dto.getTitle())
                    .link(dto.getLink())
                    .content(dto.getContent())
                    .thumbnailUrl(dto.getThumbnailUrl())
                    .publishedAt(dto.getPublishedAt())
                    .categories(categories)
                    .build();

            articleRepo.save(article);
            savedLinks.add(dto.getLink());
            saved++;
        }

        return new BatchResult(fetched, saved, skipped);
    }

    /**
     * 🔹 단일 Feed 수집 실행
     * - URL 유효성 검사
     * - URL 접근성 검사 (HEAD -> GET 폴백)
     * - Rome 라이브러리로 SyndFeed 읽기
     * - 각 SyndEntry를 RssArticleCreateDTO 변환
     * - saveArticlesBatch 호출
     */
    @Transactional
    public BatchResult collectSingleFeed(RssFeedEntity feed) {

        // 🔹 0) 활성화 상태 확인
        if (feed.getStatus() != RssFeedEntity.Status.ACTIVE) {
            // 로그 기록
            log.warn("⚠️ 비활성화된 피드 수집 시도 | URL: {}", feed.getUrl());
            // BatchResult 반환: 저장/스킵/전체 모두 0
            return new BatchResult(0, 0, 0);
        }

        // 1) URL 형식 체크
        if (!isValidUrl(feed.getUrl())) {
            log.warn("✔ URL 형식 오류: {}", feed.getUrl());
            return new BatchResult(0, 0, 0);
        }

        // 2) URL 접근성 체크 (HEAD 요청 실패 시 GET 폴백)
        if (!isUrlReachable(feed.getUrl())) {
            log.warn("🚫 URL 접근 불가: {}", feed.getUrl());
            return new BatchResult(0, 0, 0);
        }

        List<RssArticleCreateDTO> dtos;

        try {
            URL feedUrl = new URL(feed.getUrl());
            try (XmlReader reader = new XmlReader(feedUrl)) {
                SyndFeedInput input = new SyndFeedInput();
                SyndFeed syndFeed = input.build(reader);

                // SyndEntry -> DTO 변환
                dtos = syndFeed.getEntries().stream()
                        .map(entry -> RssArticleCreateDTO.from((SyndEntry) entry))
                        .collect(Collectors.toList());
            }
        } catch (Exception e) {
            log.error("❌ 수집 실패 | {} | {}", feed.getUrl(), e.getMessage(), e);
            return new BatchResult(0, 0, 0);
        }

        // 3) 배치 저장 실행
        BatchResult result = saveArticlesBatch(feed, dtos);

        // 4) 마지막 수집 시간 갱신
        try {
            feedService.updateLastFetched(feed);
        } catch (Exception e) {
            log.warn("⚠️ 마지막 수집시간 갱신 실패 | {} | {}", feed.getUrl(), e.getMessage());
        }

        log.info("📌 단일 수집 완료 | URL: {} | 저장:{} | 스킵:{} | 전체:{}",
                feed.getUrl(), result.saved(), result.skipped(), result.fetched());

        return result;
    }

    /**
     * 🔹 특정 출처(SourceName) 활성화된 RSS 피드 전체 수집
     *
     * 설명:
     * - 전달받은 sourceName과 일치하는 활성화(feed.status=ACTIVE) 피드만 수집
     * - 개별 피드 수집 중 예외 발생 시 로그만 기록하고 다음 피드 계속 진행
     * - 수집 후 저장된 기사 수, 중복 스킵 수, 전체 수집된 기사 수를 BatchResult로 반환
     * @param sourceName 수집 대상 RSS 출처 이름
     * @return BatchResult 수집 통계(fetched, saved, skipped)
     */
    @Transactional
    public BatchResult collectFeedsBySourceName(String sourceName) {

        int totalFetched = 0; // 전체 수집 시도된 기사 수
        int totalSaved = 0;   // DB에 새로 저장된 기사 수
        int totalSkipped = 0; // 중복 또는 오류로 저장되지 않은 기사 수

        // 1️⃣ sourceName과 일치하며 활성화된 피드만 필터링
        List<RssFeedEntity> feeds = feedService.getAllActiveFeeds().stream()
                .filter(f -> f.getSourceName().equals(sourceName))
                .toList();

        // 2️⃣ 각 피드 수집 반복
        for (RssFeedEntity feed : feeds) {
            try {
                BatchResult result = collectSingleFeed(feed); // 단일 피드 수집
                totalFetched += result.fetched();
                totalSaved += result.saved();
                totalSkipped += result.skipped();
            } catch (Exception e) {
                // 예외 발생 시 로그 기록 후 다음 피드 계속
                log.error("⚠️ SourceName 전체 수집 오류 | {} | {}", feed.getUrl(), e.getMessage(), e);
            }
        }

        // 3️⃣ 전체 수집 완료 로그
        log.info("🔥 '{}' 전체 수집 완료 | 저장:{} | 스킵:{} | 전체:{}",
                sourceName, totalSaved, totalSkipped, totalFetched);

        // 4️⃣ 수집 통계 반환
        return new BatchResult(totalFetched, totalSaved, totalSkipped);
    }


    /**
     * 🔹 전체 Feed 수집 실행
     * - 활성화된 피드(status='active')만 수집
     * - 개별 피드 예외 발생 시 로그만 기록하고 다음 피드 계속
     */
    @Transactional
    public BatchResult collectAllFeeds() {

        int totalFetched = 0;
        int totalSaved = 0;
        int totalSkipped = 0;

        // 활성화된 피드만 조회
        List<RssFeedEntity> feeds = feedService.getAllActiveFeeds();

        for (RssFeedEntity feed : feeds) {
            try {
                BatchResult result = collectSingleFeed(feed);
                totalFetched += result.fetched();
                totalSaved += result.saved();
                totalSkipped += result.skipped();
            } catch (Exception e) {
                log.error("⚠️ 전체 수집 오류 | {} | {}", feed.getUrl(), e.getMessage(), e);
            }
        }

        log.info("🔥 전체 수집 완료 | 저장:{} | 스킵:{} | 전체:{}",
                totalSaved, totalSkipped, totalFetched);

        return new BatchResult(totalFetched, totalSaved, totalSkipped);
    }

    /* ====================== URL 유틸 ====================== */

    // URL 유효성 검사
    private boolean isValidUrl(String url) {
        try {
            new URL(url).toURI();
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // URL 접근성 검사 (HEAD -> GET 폴백)
    private boolean isUrlReachable(String url) {
        try {
            HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
            conn.setRequestMethod("HEAD");
            conn.setInstanceFollowRedirects(true);
            conn.setConnectTimeout(3000);
            conn.setReadTimeout(3000);
            int code = conn.getResponseCode();
            if (code >= 200 && code < 400) return true;
        } catch (Exception ignored) {}

        // GET 폴백
        try {
            HttpURLConnection conn2 = (HttpURLConnection) new URL(url).openConnection();
            conn2.setRequestMethod("GET");
            conn2.setInstanceFollowRedirects(true);
            conn2.setConnectTimeout(3000);
            conn2.setReadTimeout(3000);
            conn2.setRequestProperty("User-Agent", "Makgora (https://makgora.store)");
            int code2 = conn2.getResponseCode();
            return (code2 >= 200 && code2 < 400);
        } catch (Exception e) {
            return false;
        }
    }
}
