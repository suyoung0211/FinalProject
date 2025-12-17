package org.usyj.makgora.rssfeed.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.article.dto.response.ArticleResponse;
import org.usyj.makgora.article.entity.ArticleCategoryEntity;
import org.usyj.makgora.article.repository.ArticleCategoryRepository;
import org.usyj.makgora.rssfeed.dto.RssFeedUpdateRequest;
import org.usyj.makgora.rssfeed.entity.RssFeedEntity;
import org.usyj.makgora.rssfeed.repository.RssFeedRepository;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RssFeedUpdateService {

    private final RssFeedRepository rssFeedRepository;
    private final ArticleCategoryRepository categoryRepository;

    /**
     * RSS 피드 수정 처리 (전체 코드)
     */
    @Transactional
    public ArticleResponse updateRssFeed(RssFeedUpdateRequest request) {

        // 1️⃣ feed 엔티티 조회 + categories 함께 조회 (성능 최적화)
        RssFeedEntity feed = rssFeedRepository.findByIdWithCategories(request.getId())
                .orElseThrow(() -> new IllegalArgumentException("해당 RSS 피드는 존재하지 않습니다."));

        // 2️⃣ URL 업데이트
        if (request.getUrl() != null && !request.getUrl().isBlank()) {
            feed.setUrl(request.getUrl());
        }

        // 3️⃣ 출처명 업데이트
        if (request.getSourceName() != null && !request.getSourceName().isBlank()) {
            feed.setSourceName(request.getSourceName());
        }

        // 4️⃣ 카테고리 변경 (입력된 값으로 완전 대체)
        if (request.getCategoryNames() != null) {
            // 1) 기존 카테고리 제거
            feed.getCategories().clear();
            // 2) 새 카테고리 조회
            Set<ArticleCategoryEntity> newCategories = request.getCategoryNames().stream()
                    .map(name -> categoryRepository.findByName(name)
                            .orElseThrow(() ->
                                    new RuntimeException("카테고리명 [" + name + "] 를 찾을 수 없습니다.")
                            )
                    )
                    .collect(Collectors.toSet());
            // 3) feed 컬렉션에 새 카테고리 추가
            feed.getCategories().addAll(newCategories);
        }

        // 5️⃣ 상태 업데이트
        if (request.getStatus() != null) {
            feed.setStatus(RssFeedEntity.Status.valueOf(request.getStatus().toUpperCase()));
        }

        // 6️⃣ 저장 후 DTO 변환 반환
        return convertToDto(feed);
    }

    /**
     * Entity → DTO 변환 메서드
     */
    private ArticleResponse convertToDto(RssFeedEntity feed) {

        Set<String> categoryNames = feed.getCategories()
                .stream()
                .map(ArticleCategoryEntity::getName)
                .collect(Collectors.toSet());

        return ArticleResponse.builder()
                .id(feed.getId())
                .sourceName(feed.getSourceName())
                .url(feed.getUrl())
                .categories(categoryNames)
                .articleCount(feed.getCategories().size()) // 필요 시 변경 가능
                .status(feed.getStatus().name().toLowerCase())
                .build();
    }
}