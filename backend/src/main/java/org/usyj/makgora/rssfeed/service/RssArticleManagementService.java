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
import org.usyj.makgora.rssfeed.repository.RssArticleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RssArticleManagementService {

    private final RssFeedManagementService feedService; // 피드/카테고리 관리 서비스
    private final RssArticleRepository articleRepo; // 기사 저장/조회용 JPA 레포지토리

    /**
     * 배치 단위로 RSS 기사 저장
     * - feed: 해당 기사가 속한 RSS Feed 엔터티
     * - dtos: 외부 RSS에서 파싱한 기사 DTO 리스트
     * 
     * 1️⃣ 중복 기사 처리: DB 또는 배치 내 중복
     * 2️⃣ 기사 카테고리 처리: DTO에서 카테고리 있으면 getOrCreateCategories 호출, 없으면 feed 기본 카테고리 사용
     * 3️⃣ 기사 엔터티 생성 후 저장
     * 4️⃣ 이번 배치에서 실제 저장된 기사 수 반환
     */
    @Transactional
    public int saveArticlesBatch(RssFeedEntity feed, List<RssArticleDTO> dtos) {
        Set<String> savedLinksSet = new HashSet<>(); // 배치 내 중복 방지용 링크 저장
        int savedCount = 0; // 이번 배치에서 실제 저장된 기사 수

        for (RssArticleDTO dto : dtos) {
            String link = dto.getLink();

            // DB에 이미 존재하거나 배치 내 중복이면 건너뜀
            if (articleRepo.existsByLink(link) || savedLinksSet.contains(link)) {
                continue; 
            }

            // 카테고리 처리: DTO에 카테고리 정보가 있으면 여러 카테고리 처리
            Set<ArticleCategoryEntity> categories;
            if (dto.getCategories() != null && !dto.getCategories().isEmpty()) {
                // getOrCreateCategories 호출 → DTO 카테고리를 DB에서 조회/없으면 생성
                categories = feedService.getOrCreateCategories(new HashSet<>(dto.getCategories()));
            } else {
                // DTO 카테고리 없으면 feed 기본 카테고리 사용
                categories = feed.getCategories() != null ? new HashSet<>(feed.getCategories()) : new HashSet<>();
            }

            // RssArticle 엔터티 생성
            RssArticleEntity article = RssArticleEntity.builder()
                    .feed(feed) // 기사와 피드 연관
                    .title(dto.getTitle())
                    .link(link)
                    .content(dto.getContent())
                    .thumbnailUrl(dto.getThumbnailUrl())
                    .publishedAt(dto.getPublishedAt())
                    .categories(categories) // 기사-카테고리 다대다 연관
                    .build();

            // DB에 저장
            articleRepo.save(article);

            // 배치 내 중복 방지용 Set에 링크 저장
            savedLinksSet.add(link);

            // 저장된 기사 수 증가
            savedCount++;
        }

        // 이번 배치에서 실제 저장된 기사 수 반환
        return savedCount;
    }

    /**
     * DB에 저장된 전체 기사 수 조회
     * - 통계나 로그용으로 사용
     */
    public int countAllSavedArticles() {
        return (int) articleRepo.count();
    }
}
