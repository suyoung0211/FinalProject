package org.usyj.makgora.rssfeed.service;

import java.util.Set;

import org.springframework.stereotype.Service;
import org.usyj.makgora.entity.ArticleCategoryEntity;
import org.usyj.makgora.entity.RssFeedEntity;
import org.usyj.makgora.rssfeed.repository.ArticleCategoryRepository;
import org.usyj.makgora.rssfeed.repository.RssFeedRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RssFeedManagementService {

    private final ArticleCategoryRepository categoryRepo;
    private final RssFeedRepository feedRepo;

    // 카테고리 조회, 없으면 생성
    public ArticleCategoryEntity getOrCreateCategory(String categoryName) {
        return categoryRepo.findByName(categoryName)
                .orElseGet(() -> categoryRepo.save(
                        ArticleCategoryEntity.builder().name(categoryName).build()
                ));
    }

    // 피드 조회, 없으면 생성
    public RssFeedEntity getOrCreateFeed(String feedUrl, String sourceName, Set<ArticleCategoryEntity> categories) {
        return feedRepo.findByUrl(feedUrl)
                .orElseGet(() -> feedRepo.save(
                        RssFeedEntity.builder()
                                .url(feedUrl)
                                .sourceName(sourceName)
                                .categories(categories)
                                .build()
                ));
    }

    // 마지막 수집 시간 업데이트
    public void updateLastFetched(RssFeedEntity feed) {
        feed.setLastFetched(java.time.LocalDateTime.now());
        feedRepo.save(feed);
    }
}