package org.usyj.makgora.rssfeed.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.ArticleCategoryEntity;
import org.usyj.makgora.entity.RssFeedEntity;
import org.usyj.makgora.rssfeed.dto.RssFeedResponse;
import org.usyj.makgora.rssfeed.dto.RssFeedUpdateRequest;
import org.usyj.makgora.rssfeed.repository.ArticleCategoryRepository;
import org.usyj.makgora.rssfeed.repository.RssFeedRepository;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RssFeedUpdateService {

    private final RssFeedRepository rssFeedRepository;
    private final ArticleCategoryRepository categoryRepository;

    /**
     * RSS 피드 수정 후 DTO 반환
     * @Transactional : DB 수정 시 데이터 정합성을 보장
     */
    @Transactional
    public RssFeedResponse updateRssFeed(RssFeedUpdateRequest request) {

        // 1. 기존 피드 조회
        RssFeedEntity feed = rssFeedRepository.findById(request.getId())
                .orElseThrow(() -> new IllegalArgumentException("해당 RSS 피드는 존재하지 않습니다."));

        // 2. URL 수정
        if (request.getUrl() != null) {
            feed.setUrl(request.getUrl());
        }

        // 3. 출처명 수정
        if (request.getSourceName() != null) {
            feed.setSourceName(request.getSourceName());
        }

        // 4. 카테고리 매핑
        if (request.getCategory() != null) {
            ArticleCategoryEntity category = categoryRepository.findByName(request.getCategory())
                .orElseThrow(() -> new RuntimeException("카테고리명 [" + request.getCategory() + "] 를 찾을 수 없습니다."));

            feed.setCategories(Set.of(category));
        }

        // 5. 상태 값 수정 (ACTIVE / INACTIVE)
        if (request.getStatus() != null) {
            feed.setStatus(
                    RssFeedEntity.Status.valueOf(request.getStatus().toUpperCase())
            );
        }

        // 6. DB 저장
        RssFeedEntity savedFeed = rssFeedRepository.save(feed);

        // 7. 엔티티 -> DTO 변환 후 반환
        return convertToDto(savedFeed);
    }

    /**
     * 엔티티 -> DTO 변환 헬퍼
     */
    private RssFeedResponse convertToDto(RssFeedEntity feed) {
        Set<String> categoryNames = feed.getCategories().stream()
                .map(ArticleCategoryEntity::getName)
                .collect(Collectors.toSet());

        return RssFeedResponse.builder()
                .id(feed.getId())
                .sourceName(feed.getSourceName())
                .url(feed.getUrl())
                .categories(categoryNames)
                .status(feed.getStatus().name().toLowerCase()) // "active"/"inactive" 변환
                .build();
    }
}
