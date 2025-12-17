package org.usyj.makgora.rssfeed.service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.usyj.makgora.article.entity.ArticleCategoryEntity;
import org.usyj.makgora.article.repository.ArticleCategoryRepository;
import org.usyj.makgora.rssfeed.dto.request.RssFeedCreateRequest;
import org.usyj.makgora.rssfeed.dto.response.Categoryresponse;
import org.usyj.makgora.rssfeed.entity.RssFeedEntity;
import org.usyj.makgora.rssfeed.repository.RssFeedRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RssFeedCreateService {

    private final RssFeedRepository rssFeedRepository;
    private final ArticleCategoryRepository categoryRepository;

    @Transactional
    public void createFeed(RssFeedCreateRequest dto) {

        // DB에서 카테고리 엔티티 조회 (없는 ID 제외 처리)
        Set<ArticleCategoryEntity> categories =
                new HashSet<>(categoryRepository.findAllById(dto.getCategoryIds()));

        // RSS 엔티티 생성
        RssFeedEntity feed = RssFeedEntity.builder()
                .url(dto.getUrl())
                .sourceName(dto.getSourceName())
                .categories(categories)
                .build();

        rssFeedRepository.save(feed);
    }

    public List<Categoryresponse> getCategories() {
        return categoryRepository.findAll().stream()
                .map(c -> new Categoryresponse(c.getId(), c.getName()))
                .toList();
    }
}
