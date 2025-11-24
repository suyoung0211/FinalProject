package org.usyj.makgora.rssfeed.service;

import java.util.HashSet;
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
public class RssArticleService {

    private final RssArticleRepository articleRepo;
    private final ArticleCategoryRepository categoryRepo;

    @Transactional
    public void saveArticle(RssArticleDTO item, RssFeedEntity feed) {
        if (articleRepo.existsByLink(item.getLink())) return;

        // Hibernate-safe mutable Set 생성
        Set<ArticleCategoryEntity> categories = new HashSet<>();

        if (item.getCategories() != null && !item.getCategories().isEmpty()) {
            for (String catName : item.getCategories()) {
                ArticleCategoryEntity cat = categoryRepo.findByName(catName)
                        .orElseGet(() -> categoryRepo.save(
                                ArticleCategoryEntity.builder().name(catName).build()
                        ));
                categories.add(cat);
            }
        } else {
            // feed에 연결된 카테고리 중 첫 번째를 기본으로 사용
            Set<ArticleCategoryEntity> feedCategories = feed.getCategories();
            if (feedCategories == null || feedCategories.isEmpty()) {
                throw new IllegalStateException("Feed에 카테고리가 없음: " + feed.getUrl());
            }
            categories.addAll(feedCategories); // mutable Set에 추가
        }

        // 엔티티 builder에서 기본 Set 초기화
        RssArticleEntity article = RssArticleEntity.builder()
            .feed(feed)
            .title(item.getTitle())
            .link(item.getLink())
            .content(item.getContent())
            .thumbnailUrl(item.getThumbnailUrl())
            .publishedAt(item.getPublishedAt())
            .categories(new HashSet<>(categories)) // 항상 mutable Set 사용
            .build();

        articleRepo.save(article);
    }
}
