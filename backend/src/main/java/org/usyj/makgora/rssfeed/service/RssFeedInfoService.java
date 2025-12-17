package org.usyj.makgora.rssfeed.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.usyj.makgora.article.dto.response.ArticleResponse;
import org.usyj.makgora.article.entity.ArticleCategoryEntity;
import org.usyj.makgora.rssfeed.entity.RssFeedEntity;
import org.usyj.makgora.rssfeed.repository.RssFeedRepository;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 🔹 RssFeedInfoService
 * - RSS Feed 목록 조회 + 기사 수 포함 응답
 * - 단일 Feed 조회 기능
 * - Feed 데이터 접근 로직을 담당하는 서비스
 */
@Service
@RequiredArgsConstructor
public class RssFeedInfoService {

    // Repository는 DB 접근만 담당 (비즈니스 로직 없음)
    private final RssFeedRepository rssFeedRepository;

    /**
     * 🔹 전체 RSS 피드 목록 + 각 피드 기사 수 조회
     * - RSS + Article JOIN 조회
     * - 조회 결과(Object[]) → DTO 변환
     */
    public List<ArticleResponse> getAllFeedsWithArticleCount() {

        List<Object[]> results = rssFeedRepository.findAllFeedsWithArticleCount();

        return results.stream()
                .map(row -> {
                    RssFeedEntity feed = (RssFeedEntity) row[0];
                    Long articleCount = (Long) row[1];

                    // 🔹 카테고리 엔티티 → 카테고리 이름(String) 변환
                    Set<String> categories = feed.getCategories().stream()
                            .map(ArticleCategoryEntity::getName)
                            .collect(Collectors.toSet());

                    return ArticleResponse.builder()
                            .id(feed.getId())
                            .sourceName(feed.getSourceName())
                            .url(feed.getUrl())
                            .categories(categories)
                            .articleCount(articleCount != null ? articleCount.intValue() : 0)
                            .lastFetched(feed.getLastFetched())
                            .status(feed.getStatus().name().toLowerCase())
                            .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * 🔹 FeedEntity 단일 조회 (ID 기준)
     * - 수정, 수집 요청 등 특정 Feed 대상 작업 시 필수
     * - 없으면 예외 발생 → 안전성 확보
     */
    public RssFeedEntity getFeedEntity(Integer feedId) {
        return rssFeedRepository.findById(feedId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Feed가 존재하지 않습니다. ID = " + feedId)
                );
    }
}
