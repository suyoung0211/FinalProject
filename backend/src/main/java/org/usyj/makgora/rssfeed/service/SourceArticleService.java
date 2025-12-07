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

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * RSS 기사 관리 서비스
 * - 배치 단위 기사 저장
 * - 개별 RSS 피드 수집
 * - URL 검증, 접근 가능 여부 체크 포함
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SourceArticleService {

    private final RssFeedManagementService feedService; // 피드/카테고리 관리 서비스
    private final RssArticleRepository articleRepo;    // 기사 저장/조회용 JPA 레포지토리

    // ------------------------
    // 1️⃣ 배치 단위 기사 저장
    // ------------------------
    @Transactional
    public int saveArticlesBatch(RssFeedEntity feed, List<RssArticleCreateDTO> dtos) {
        Set<String> savedLinksSet = new HashSet<>(); // 배치 내 중복 방지용
        int savedCount = 0; // 실제 저장된 기사 수

        for (RssArticleCreateDTO dto : dtos) {
            String link = dto.getLink();

            // DB에 이미 존재하거나 배치 내 중복이면 건너뜀
            if (articleRepo.existsByLink(link) || savedLinksSet.contains(link)) {
                continue; 
            }

            // 카테고리 처리
            Set<ArticleCategoryEntity> categories;
            if (dto.getCategories() != null && !dto.getCategories().isEmpty()) {
                categories = feedService.getOrCreateCategories(new HashSet<>(dto.getCategories()));
            } else {
                categories = feed.getCategories() != null ? new HashSet<>(feed.getCategories()) : new HashSet<>();
            }

            // RssArticle 엔터티 생성
            RssArticleEntity article = RssArticleEntity.builder()
                    .feed(feed)
                    .title(dto.getTitle())
                    .link(link)
                    .content(dto.getContent())
                    .thumbnailUrl(dto.getThumbnailUrl())
                    .publishedAt(dto.getPublishedAt())
                    .categories(categories)
                    .build();

            // DB에 저장
            articleRepo.save(article);
            savedLinksSet.add(link);
            savedCount++;
        }

        return savedCount;
    }

    // ------------------------
    // 2️⃣ 전체 기사 수 조회
    // ------------------------
    public int countAllSavedArticles() {
        return (int) articleRepo.count();
    }

    // ------------------------
    // 3️⃣ URL 검증 (형식 확인)
    // ------------------------
    private boolean isValidUrl(String url) {
        try {
            new URL(url).toURI(); // URL + URI로 형식 체크
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // ------------------------
    // 4️⃣ URL 접근 가능 여부 확인
    // ------------------------
    private boolean isUrlReachable(String url) {
        try {
            HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
            connection.setRequestMethod("HEAD");       // 바디 없이 상태 코드만 확인
            connection.setConnectTimeout(3000);        // 연결 타임아웃 3초
            connection.setReadTimeout(3000);           // 읽기 타임아웃 3초
            int responseCode = connection.getResponseCode();
            return responseCode >= 200 && responseCode < 400; // 2xx~3xx 정상 처리
        } catch (Exception e) {
            return false;
        }
    }

    // ------------------------
    // 5️⃣ 개별 RSS 피드 수집
    // ------------------------
    /**
     * 개별 RSS 피드 수집 후 기사 저장
     * - URL 형식 검증 및 접근 가능 여부 체크 포함
     * - saveArticlesBatch 재사용
     * - 수집 완료 후 lastFetched 업데이트
     *
     * @param feed 수집할 RSS Feed 엔터티
     * @param source 해당 피드의 RssFeedSource 구현체
     * @return 이번 수집에서 실제 저장된 기사 수
     */
    @Transactional
    public int collectAndSaveSingleFeed(RssFeedEntity feed, RssFeedSource source) {
        // 1. URL 형식 확인
        if (!isValidUrl(feed.getUrl())) {
            log.warn("잘못된 URL 형식: {}", feed.getUrl());
            return 0;
        }

        // 2. 접근 가능 여부 확인
        if (!isUrlReachable(feed.getUrl())) {
            log.warn("접근 불가 URL: {}", feed.getUrl());
            return 0;
        }

        List<RssArticleCreateDTO> dtos;

        try {
            // feed의 기본 카테고리 이름 사용하여 fetch 호출
            String categoryName = feed.getCategories().iterator().next().getName();
            dtos = source.fetch(categoryName, feed.getUrl());
        } catch (Exception e) {
            log.error("RSS 수집 실패: {} | {} | 에러: {}", feed.getSourceName(), feed.getUrl(), e.getMessage(), e);
            return 0;
        }

        // 기사 저장
        int savedCount = saveArticlesBatch(feed, dtos);

        // 수집 완료 후 lastFetched 업데이트
        feedService.updateLastFetched(feed);

        log.info("피드 수집 완료: {} | 저장 기사 수: {}", feed.getUrl(), savedCount);
        return savedCount;
    }
}