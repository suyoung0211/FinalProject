package org.usyj.makgora.rssfeed.service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.ArticleCategoryEntity;
import org.usyj.makgora.entity.RssArticleEntity;
import org.usyj.makgora.entity.RssFeedEntity;
import org.usyj.makgora.rssfeed.dto.RssArticleDTO;
import org.usyj.makgora.rssfeed.repository.ArticleCategoryRepository;
import org.usyj.makgora.rssfeed.repository.RssArticleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RssArticleManagementService {

    private final ArticleCategoryRepository categoryRepo;
    private final RssArticleRepository articleRepo;

    /**
     * 배치 단위로 기사 저장
     * - DB에 이미 존재하는 링크는 스킵
     * - batch 내 중복도 스킵
     * - DTO에 카테고리 없으면 feed 기본 카테고리 사용
     */
    @Transactional
    public void saveArticlesBatch(RssFeedEntity feed, List<RssArticleDTO> dtos, ArticleCategoryEntity defaultCategory) {
        // batch 내 중복 체크용 Set
        Set<String> savedLinksSet = new HashSet<>();

        for (RssArticleDTO dto : dtos) {
            String link = dto.getLink();

            // DB에 이미 존재하거나 batch 내 중복이면 저장하지 않고 스킵
            if (articleRepo.existsByLink(link) || savedLinksSet.contains(link)) {
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
                categories.add(defaultCategory);
            }

            // 기사 엔터티 생성 및 DB 저장
            articleRepo.save(RssArticleEntity.builder()
                    .feed(feed)
                    .title(dto.getTitle())
                    .link(link)
                    .content(dto.getContent())
                    .thumbnailUrl(dto.getThumbnailUrl())
                    .publishedAt(dto.getPublishedAt())
                    .categories(categories)
                    .build());

            // batch 내 저장된 링크 추가
            savedLinksSet.add(link);
        }
    }

    /**
     * 전체 저장된 기사 수 조회 (DB 기준)
     * - 전체 RSS 수집 후 정확한 저장 수 집계용
     */
    public int countAllSavedArticles() {
        return (int) articleRepo.count();
    }
}