package org.usyj.makgora.rssfeed.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.ArticleCategoryEntity;
import org.usyj.makgora.entity.RssArticleEntity;
import org.usyj.makgora.entity.RssFeedEntity;
import org.usyj.makgora.rssfeed.dto.RssArticleDTO;
import org.usyj.makgora.rssfeed.repository.ArticleCategoryRepository;
import org.usyj.makgora.rssfeed.repository.RssArticleRepository;
import org.usyj.makgora.rssfeed.repository.RssFeedRepository;
import org.usyj.makgora.rssfeed.source.RssFeedSource;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class RssFeedService {

    private final List<RssFeedSource> sources;
    private final ArticleCategoryRepository categoryRepo;
    private final RssFeedRepository feedRepo;
    private final RssArticleRepository articleRepo;

    @Transactional
    public void collectAndSaveAllFeeds() {
        int totalSaved = 0;
        int totalSkipped = 0;
        int totalFetched = 0;

        for (RssFeedSource source : sources) {
            String sourceName = getSourceNameFromClass(source); // 소스 이름 추출
            Map<String, String> categoryFeeds = source.getCategoryFeeds();

            for (var entry : categoryFeeds.entrySet()) {
                String categoryName = entry.getKey();
                String feedUrl = entry.getValue();

                // 기본 카테고리 확보
                ArticleCategoryEntity defaultCategory = categoryRepo.findByName(categoryName)
                        .orElseGet(() -> categoryRepo.save(
                                ArticleCategoryEntity.builder().name(categoryName).build()
                        ));

                // 피드 엔터티 조회/생성 시 category 설정
                Set<ArticleCategoryEntity> defaultCategories = new HashSet<>();
                defaultCategories.add(defaultCategory);

                RssFeedEntity feed = feedRepo.findByUrl(feedUrl)
                        .orElseGet(() -> feedRepo.save(
                                RssFeedEntity.builder()
                                        .url(feedUrl)
                                        .sourceName(sourceName)
                                        .categories(defaultCategories)
                                        .build()
                        ));

                List<RssArticleDTO> parsedItems;
                try {
                    parsedItems = source.fetch(categoryName, feedUrl);
                } catch (Exception e) {
                    log.error("RSS 수집 실패: {} | {} | 에러: {}", sourceName, feedUrl, e.getMessage(), e);
                    continue;
                }

                int savedCount = 0;
                int skippedCount = 0;

                for (RssArticleDTO dto : parsedItems) {
                    if (articleRepo.existsByLink(dto.getLink())) {
                        skippedCount++;
                        continue;
                    }

                    // DTO에서 다중 카테고리 적용
                    List<ArticleCategoryEntity> articleCategories = new ArrayList<>();
                    if (dto.getCategories() != null && !dto.getCategories().isEmpty()) {
                        for (String catName : dto.getCategories()) {
                            ArticleCategoryEntity cat = categoryRepo.findByName(catName)
                                    .orElseGet(() -> categoryRepo.save(
                                            ArticleCategoryEntity.builder().name(catName).build()
                                    ));
                            articleCategories.add(cat);
                        }
                    } else {
                        // 기본 카테고리
                        articleCategories.add(defaultCategory);
                    }

                    // 다중 카테고리 대응 RssArticleEntity 저장
                    RssArticleEntity article = RssArticleEntity.builder()
                            .feed(feed)
                            .title(dto.getTitle())
                            .link(dto.getLink())
                            .content(dto.getContent())
                            .thumbnailUrl(dto.getThumbnailUrl())
                            .publishedAt(dto.getPublishedAt())
                            .build();

                    // 다대다 관계 설정 (List → Set 변환)
                    article.setCategories(new HashSet<>(articleCategories));

                    articleRepo.save(article);
                    savedCount++;
                }

                totalSaved += savedCount;
                totalSkipped += skippedCount;
                totalFetched += parsedItems.size();

                feed.setLastFetched(LocalDateTime.now());
                feedRepo.save(feed);

                log.info("Feed 수집 완료: {} | {} | 저장: {} | 스킵(중복): {} | 파싱된 기사 수: {}",
                        sourceName, feedUrl, savedCount, skippedCount, parsedItems.size());
            }
        }

        // 전체 합산 로그
        log.info("전체 RSS 수집 완료: 저장된 기사 수: {}, 스킵(중복): {}, 파싱된 기사 전체 수: {}",
                totalSaved, totalSkipped, totalFetched);
    }

    private String getSourceNameFromClass(RssFeedSource source) {
        String simpleName = source.getClass().getSimpleName();
        if (simpleName.endsWith("Source")) {
            return simpleName.substring(0, simpleName.length() - 6); // GuardianSource -> Guardian
        }
        return simpleName;
    }
}
