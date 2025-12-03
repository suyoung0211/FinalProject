package org.usyj.makgora.rssfeed.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.usyj.makgora.entity.ArticleCategoryEntity;
import org.usyj.makgora.entity.RssFeedEntity;
import org.usyj.makgora.rssfeed.dto.RssFeedResponse;
import org.usyj.makgora.rssfeed.repository.RssFeedRepository;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RssFeedInfoService {

    private final RssFeedRepository rssFeedRepository;

    public List<RssFeedResponse> getAllFeedsWithArticleCount() {
        // Repository에서 모든 Feed + ArticleCount를 가져오는 쿼리 사용
        List<Object[]> results = rssFeedRepository.findAllFeedsWithArticleCount();

        // Object[] -> DTO 변환 후 반환
        return results.stream()
                .map((Object[] r) -> {
                    RssFeedEntity feed = (RssFeedEntity) r[0];
                    Long count = (Long) r[1];

                    // 카테고리 이름만 추출
                    Set<String> categories = feed.getCategories().stream()
                            .map(ArticleCategoryEntity::getName)
                            .collect(Collectors.toSet());

                    // DTO 빌드
                    return RssFeedResponse.builder()
                            .id(feed.getId())
                            .sourceName(feed.getSourceName())
                            .url(feed.getUrl())
                            .categories(categories)
                            .articleCount(count.intValue())
                            .lastFetched(feed.getLastFetched())
                            .status(feed.getStatus().name().toLowerCase()) // "active"/"inactive"
                            .build();
                })
                .collect(Collectors.toList()); // 최종 결과 반환
    }
}   