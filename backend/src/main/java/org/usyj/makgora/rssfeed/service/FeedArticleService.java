package org.usyj.makgora.rssfeed.service;

import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.ArticleCategoryEntity;
import org.usyj.makgora.entity.RssArticleEntity;
import org.usyj.makgora.entity.RssFeedEntity;
import org.usyj.makgora.rssfeed.dto.RssArticleCreateDTO;
import org.usyj.makgora.rssfeed.repository.RssArticleRepository;
import org.usyj.makgora.rssfeed.source.RssFeedSource;
import org.usyj.makgora.rssfeed.source.SourceRegistry;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 🔹 DB 기반 RSS/URL 기사 수집 서비스
 * - DB에 저장된 활성 피드를 기준으로 기사 수집
 * - 단일 피드 또는 전체 활성 피드 기사 수집
 * - 배치 단위 기사 저장
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FeedArticleService {

    private final RssArticleRepository articleRepo;          // 기사 저장/조회용 JPA 레포지토리
    private final RssFeedManagementService feedService;      // 피드 조회/lastFetched 업데이트, 카테고리 관리
    private final SourceRegistry sourceRegistry;             // RSS 소스를 관리 로직을 연결하는 매핑 관리 역할

    // ========================
    // 🔹 배치 단위 기사 저장
    // ========================
    @Transactional
    public int saveArticlesBatch(RssFeedEntity feed, List<RssArticleCreateDTO> dtos) {
        Set<String> savedLinks = new HashSet<>(); // 배치 내 중복 방지
        int savedCount = 0;

        for (RssArticleCreateDTO dto : dtos) {
            // 1️⃣ DB 중복 또는 배치 내 중복이면 건너뜀
            if (articleRepo.existsByLink(dto.getLink()) || savedLinks.contains(dto.getLink())) continue;

            // 2️⃣ 카테고리 처리
            Set<ArticleCategoryEntity> categories = (dto.getCategories() != null && !dto.getCategories().isEmpty())
                    ? feedService.getOrCreateCategories(new HashSet<>(dto.getCategories())) // DTO 카테고리 사용
                    : feed.getCategories() != null ? new HashSet<>(feed.getCategories())     // 없으면 feed 기본 카테고리
                    : new HashSet<>();

            // 3️⃣ RssArticleEntity 생성 및 DB 저장
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
            savedCount++;
        }

        return savedCount;
    }

    // ========================
    // 🔹 단일 피드 기사 수집
    // ========================
    @Transactional
    public int collectSingleFeed(RssFeedEntity feed, RssFeedSource source) {
        // 1️⃣ URL 형식 검증
        if (!isValidUrl(feed.getUrl())) {
            log.warn("잘못된 URL: {}", feed.getUrl());
            return 0;
        }

        // 2️⃣ URL 접근 가능 여부 확인
        if (!isUrlReachable(feed.getUrl())) {
            log.warn("접근 불가 URL: {}", feed.getUrl());
            return 0;
        }

        // 3️⃣ 기사 수집
        List<RssArticleCreateDTO> dtos;
        try {
            // feed 기본 카테고리 사용
            String categoryName = feed.getCategories().isEmpty() ? "기본" : feed.getCategories().iterator().next().getName();
            dtos = source.fetch(categoryName, feed.getUrl()); // **DB 조회 없음, DTO 생성만**
        } catch (Exception e) {
            log.error("기사 수집 실패 | {} | {} | {}", feed.getSourceName(), feed.getUrl(), e.getMessage(), e);
            return 0;
        }

        // 4️⃣ 기사 저장
        int savedCount = saveArticlesBatch(feed, dtos);

        // 5️⃣ 수집 완료 후 lastFetched 업데이트
        feedService.updateLastFetched(feed);

        log.info("단일 피드 수집 완료 | {} | 저장 기사 수: {}", feed.getUrl(), savedCount);
        return savedCount;
    }

    // ========================
    // 🔹 전체 활성 피드 기사 수집
    // ========================
    @Transactional
    public int collectAllFeeds() {
        int totalSaved = 0;

        // 1️⃣ 활성 상태인 피드만 DB에서 조회
        List<RssFeedEntity> allFeeds = feedService.getAllActiveFeeds();

        for (RssFeedEntity feed : allFeeds) {
            try {
                // 2️⃣ 피드에 연결된 Source 객체 가져오기
                RssFeedSource source = sourceRegistry.getSource(feed.getSourceName());

                // 3️⃣ 단일 피드 기사 수집 호출
                int saved = collectSingleFeed(feed, source);
                totalSaved += saved;
            } catch (Exception e) {
                log.error("전체 수집 중 오류 | {} | {} | {}", feed.getSourceName(), feed.getUrl(), e.getMessage(), e);
            }
        }

        log.info("전체 피드 수집 완료 | 총 저장 기사 수: {}", totalSaved);
        return totalSaved;
    }

    // ========================
    // 🔹 URL 형식 검증
    // ========================
    private boolean isValidUrl(String url) {
        try { 
            new URL(url).toURI(); 
            return true; 
        } catch (Exception e) { 
            return false; 
        }
    }

    // ========================
    // 🔹 URL 접근 가능 여부 확인
    // ========================
    private boolean isUrlReachable(String url) {
        try {
            HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
            conn.setRequestMethod("HEAD");
            conn.setConnectTimeout(3000);
            conn.setReadTimeout(3000);
            int code = conn.getResponseCode();
            return code >= 200 && code < 400;
        } catch (Exception e) {
            return false;
        }
    }
}
