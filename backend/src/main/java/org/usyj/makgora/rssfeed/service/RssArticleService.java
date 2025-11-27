package org.usyj.makgora.rssfeed.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.ArticleCategoryEntity;
import org.usyj.makgora.entity.RssArticleEntity;
import org.usyj.makgora.entity.RssFeedEntity;
import org.usyj.makgora.rssfeed.dto.RssArticleDTO;
import org.usyj.makgora.rssfeed.repository.ArticleCategoryRepository;
import org.usyj.makgora.rssfeed.repository.RssArticleRepository;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class RssArticleService {

    private final RssArticleRepository articleRepo;
    private final ArticleCategoryRepository categoryRepo;

    /**
     * 여러 기사 저장
     * @param feed 기사 소속 feed
     * @param dtos 기사 DTO 리스트
     * @return ArticleSaveResult (saved / skipped / total)
     */
    @Transactional
    public ArticleSaveResult saveArticles(RssFeedEntity feed, List<RssArticleDTO> dtos) {
        int savedCount = 0;
        int skippedCount = 0;

        // 이번 batch에서 이미 저장한 링크를 기록
        Set<String> savedLinksSet = new HashSet<>();

        for (RssArticleDTO dto : dtos) {
            String link = dto.getLink();

            // DB 또는 이번 batch에서 중복이면 skip
            if (savedLinksSet.contains(link) || articleRepo.existsByLink(link)) {
                skippedCount++;
                continue;
            }

            // 카테고리 처리
            Set<ArticleCategoryEntity> categories = new HashSet<>();
            if (dto.getCategories() != null && !dto.getCategories().isEmpty()) {
                for (String catName : dto.getCategories()) {
                    ArticleCategoryEntity cat = categoryRepo.findByName(catName)
                            .orElseGet(() -> categoryRepo.save(
                                    ArticleCategoryEntity.builder().name(catName).build()
                            ));
                    categories.add(cat);
                }
            } else {
                categories.addAll(feed.getCategories());
            }

            // 기사 엔터티 생성
            RssArticleEntity article = RssArticleEntity.builder()
                    .feed(feed)
                    .title(dto.getTitle())
                    .link(link)
                    .content(dto.getContent())
                    .thumbnailUrl(dto.getThumbnailUrl())
                    .publishedAt(dto.getPublishedAt())
                    .categories(categories)
                    .build();

            articleRepo.save(article);
            savedLinksSet.add(link);
            savedCount++;
        }

        return new ArticleSaveResult(savedCount, skippedCount, dtos.size());
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    public static class ArticleSaveResult {
        private int saved;
        private int skipped;
        private int total;
    }
}
