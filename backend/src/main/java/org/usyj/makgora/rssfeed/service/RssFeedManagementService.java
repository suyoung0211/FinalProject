package org.usyj.makgora.rssfeed.service;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.ArticleCategoryEntity;
import org.usyj.makgora.entity.RssFeedEntity;
import org.usyj.makgora.rssfeed.repository.ArticleCategoryRepository;
import org.usyj.makgora.rssfeed.repository.RssFeedRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class RssFeedManagementService {

    private final ArticleCategoryRepository categoryRepo; // 카테고리 저장/조회용 레포지토리
    private final RssFeedRepository feedRepo;             // 피드 저장/조회용 레포지토리

    // 배치 내 중복 방지용 캐시
    private final Map<String, ArticleCategoryEntity> categoryCache = new HashMap<>();
    private final Map<String, RssFeedEntity> feedCache = new HashMap<>();

    /**
     * RSS 피드 단일 카테고리 조회/생성
     * - RSS 피드는 보통 하나의 카테고리 기사만 가져옴
     * - DB 조회 후 없으면 새로 생성
     * - 배치 내 중복 조회 방지를 위해 캐시에 저장
     */
    @Transactional
    public ArticleCategoryEntity getOrCreateCategory(String categoryName) {
        // 캐시에 이미 존재하면 바로 반환
        if (categoryCache.containsKey(categoryName)) {
            return categoryCache.get(categoryName);
        }

        // DB 조회 후 없으면 새로 저장
        ArticleCategoryEntity category = categoryRepo.findByName(categoryName)
                .orElseGet(() -> categoryRepo.save(
                        ArticleCategoryEntity.builder().name(categoryName).build()
                ));

        // 캐시에 저장
        categoryCache.put(categoryName, category);
        return category;
    }

    /**
     * 여러 카테고리 처리 (다대다 관계용)
     * - 기사 DTO에서 여러 카테고리 가능
     * - DB 조회/생성 후 Set으로 반환
     * - DTO에 카테고리가 없으면 feed 기본 카테고리 사용
     */
    @Transactional
    public Set<ArticleCategoryEntity> getOrCreateCategories(Set<String> categoryNames) {
        Set<ArticleCategoryEntity> result = new HashSet<>();
        for (String name : categoryNames) {
            // 단일 카테고리 처리 메서드 재사용
            result.add(getOrCreateCategory(name));
        }
        return result;
    }

    /**
     * RSS Feed 조회/생성
     * - feed URL 기준 DB 조회
     * - 없으면 새 Feed 엔터티 생성 후 DB 저장
     * - feed 엔터티에 기본 카테고리 세팅 (Set)
     * - 배치 내 중복 방지를 위해 캐시에 저장
     */
    @Transactional
    public RssFeedEntity getOrCreateFeed(String feedUrl, String sourceName, Set<ArticleCategoryEntity> categories) {
        // 캐시에 이미 존재하면 바로 반환
        if (feedCache.containsKey(feedUrl)) {
            return feedCache.get(feedUrl);
        }

        // DB 조회 후 없으면 새로 저장
        RssFeedEntity feed = feedRepo.findByUrl(feedUrl)
                .orElseGet(() -> {
                    RssFeedEntity newFeed = RssFeedEntity.builder()
                            .url(feedUrl)
                            .sourceName(sourceName)
                            .categories(new HashSet<>(categories)) // DB에서 관리할 Set으로 저장
                            .build();
                    return feedRepo.save(newFeed);
                });

        // 캐시에 저장
        feedCache.put(feedUrl, feed);
        return feed;
    }

    /** 활성화된 모든 피드 조회 */
    @Transactional(readOnly = true)
    public List<RssFeedEntity> getAllActiveFeeds() {
        return feedRepo.findAllActiveFeeds();
    }

    /**
     * RSS 피드 마지막 수집 시간 업데이트
     * - 기사 수집 후 호출하여 lastFetched 업데이트
     */
    @Transactional
    public void updateLastFetched(RssFeedEntity feed) {
        feed.setLastFetched(java.time.LocalDateTime.now());
        feedRepo.save(feed);
    }

    /**
     * 배치 종료 후 캐시 초기화
     * - 다음 배치에서 중복 처리 방지용 캐시를 초기화
     */
    public void clearCache() {
        categoryCache.clear();
        feedCache.clear();
    }

    /**
     * 🔹 피드 하드 삭제
     * @param feedId 삭제할 피드 ID
     * @throws IllegalArgumentException 피드가 존재하지 않을 경우
     */
    @Transactional
    public void deleteFeed(Integer feedId) {
        RssFeedEntity feed = feedRepo.findById(feedId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 피드입니다. ID: " + feedId));

        feedRepo.delete(feed);
        log.info("🗑️ 피드 하드 삭제 완료 | ID: {} | 이름: {}", feed.getId(), feed.getSourceName());
    }

}
