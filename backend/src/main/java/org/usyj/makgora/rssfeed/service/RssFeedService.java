package org.usyj.makgora.rssfeed.service;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.ArticleCategoryEntity;
import org.usyj.makgora.entity.RssFeedEntity;
import org.usyj.makgora.rssfeed.dto.RssArticleCreateDTO;
import org.usyj.makgora.rssfeed.repository.RssFeedRepository;
import org.usyj.makgora.rssfeed.source.RssFeedSource;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * RSS 피드 수집 및 저장 서비스
 * - 모든 RSS 소스를 순회
 * - 각 카테고리별 RSS feed 수집
 * - 기사 저장 (중복 체크 포함)
 * - feed 마지막 수집 시간 업데이트
 * - 전체 수집 완료 후 배치 기준 저장/스킵/파싱 집계
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RssFeedService {

    private final List<RssFeedSource> sources;
    private final RssFeedManagementService feedService;
    private final RssArticleManagementService articleService;
    private final RssFeedRepository feedRepo;

    @Transactional
    public void collectAndSaveAllFeeds() {
        int totalFetched = 0;   // 전체 파싱 수 누적
        int totalSaved = 0;     // 배치 기준 저장된 기사 수 누적
        int totalSkipped = 0;   // 배치 기준 스킵 기사 수 누적

        for (RssFeedSource source : sources) {

            String sourceName = getSourceNameFromClass(source);
            Map<String, String> categoryFeeds = source.getCategoryFeeds();

            for (Map.Entry<String, String> entry : categoryFeeds.entrySet()) {
                String categoryName = entry.getKey();
                String feedUrl = entry.getValue();

                // 1. 기본 카테고리 확보
                ArticleCategoryEntity defaultCategory = feedService.getOrCreateCategory(categoryName);

                // 2. 피드 엔터티 조회/생성
                Set<ArticleCategoryEntity> defaultCategories = new HashSet<>();
                defaultCategories.add(defaultCategory);
                RssFeedEntity feed = feedService.getOrCreateFeed(feedUrl, sourceName, defaultCategories);

                // 3. 기사 fetch
                List<RssArticleCreateDTO> dtos;
                try {
                    dtos = source.fetch(categoryName, feedUrl);
                } catch (Exception e) {
                    log.error("RSS 수집 실패: {} | {} | 에러: {}", sourceName, feedUrl, e.getMessage(), e);
                    continue;
                }

                // 4. 전체 파싱 수 누적
                totalFetched += dtos.size();

                // 5. 배치 저장 및 실제 저장/스킵 계산
                int savedThisBatch = articleService.saveArticlesBatch(feed, dtos); // 저장된 기사 수
                totalSaved += savedThisBatch;
                totalSkipped += dtos.size() - savedThisBatch;

                // 6. 피드 마지막 수집 시간 업데이트
                feedService.updateLastFetched(feed);
            }
        }

        // 7. 전체 피드 갯수 조회 (DB 기준)
        int feedCount = (int) feedRepo.count();

        log.info("전체 피드 갯수: {}", feedCount);
        log.info("저장된 기사: {}, 스킵: {}, 전체 파싱: {}",
                totalSaved, totalSkipped, totalFetched);
    }

    /**
     * 소스 클래스명에서 Source 접미사 제거
     */
    private String getSourceNameFromClass(RssFeedSource source) {
        String simpleName = source.getClass().getSimpleName();
        if (simpleName.endsWith("Source")) {
            return simpleName.substring(0, simpleName.length() - 6);
        }
        return simpleName;
    }
}
