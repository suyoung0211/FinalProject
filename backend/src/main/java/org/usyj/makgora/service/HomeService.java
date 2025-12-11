package org.usyj.makgora.service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.usyj.makgora.dto.home.AiBannerDto;
import org.usyj.makgora.dto.home.HotIssueDto;
import org.usyj.makgora.dto.home.SlideNewsDto;
import org.usyj.makgora.dto.home.TopVoteDto;
import org.usyj.makgora.entity.ArticleAiTitleEntity;
import org.usyj.makgora.entity.RssArticleEntity;

import org.usyj.makgora.rssfeed.repository.ArticleAiTitleRepository;
import org.usyj.makgora.repository.VoteRepository;
import org.usyj.makgora.response.home.HomeResponse;
import org.usyj.makgora.rssfeed.repository.RssArticleRepository;

@Service
@RequiredArgsConstructor
public class HomeService {

    private final VoteRepository voteRepository;
    private final RssArticleRepository articleRepository;
    private final ArticleAiTitleRepository aiTitleRepository;


    /** 공통: AI 제목 우선 가져오기 */
    private String getDisplayTitle(RssArticleEntity article) {
        ArticleAiTitleEntity ai = aiTitleRepository.findByArticle_Id(article.getId());
        return (ai != null && ai.getAiTitle() != null)
                ? ai.getAiTitle()
                : article.getTitle();
    }


    public HomeResponse getHomeData() {

        /* 1) 뉴스 슬라이드 */
        List<RssArticleEntity> slideArticles = articleRepository.findAll().stream()
                .filter(a -> a.getThumbnailUrl() != null)
                .sorted(Comparator.comparing(RssArticleEntity::getPublishedAt).reversed())
                .limit(10)
                .toList();

        List<SlideNewsDto> newsSlides = slideArticles.stream()
                .map(a -> SlideNewsDto.builder()
                        .articleId(a.getId())
                        .aiTitle(getDisplayTitle(a))
                        .thumbnail(a.getThumbnailUrl())
                        .publishedAt(a.getPublishedAt())
                        .build())
                .toList();


        /* 2) TOP 3 투표 */
        List<TopVoteDto> topVotes = voteRepository.findTop3ByOrderByTotalPointsDesc()
                .stream()
                .map(v -> TopVoteDto.builder()
                        .voteId(v.getId())
                        .title(v.getTitle())
                        .status(v.getStatus().name())
                        .endAt(v.getEndAt())
                        .totalPoints(v.getTotalPoints())
                        .build()
                )
                .toList();


        /* 3) 최근 24시간 핫이슈 */
        LocalDateTime limit = LocalDateTime.now().minusDays(1);

        List<HotIssueDto> hotIssues = articleRepository.findAll().stream()
                .filter(a -> a.getPublishedAt() != null && a.getPublishedAt().isAfter(limit))
                .map(a -> HotIssueDto.builder()
                        .articleId(a.getId())
                        .title(a.getTitle())                  // 원본
                        .aiTitle(getDisplayTitle(a))          // ★ AI 제목
                        .thumbnail(a.getThumbnailUrl())
                        .publishedAt(a.getPublishedAt())
                        .categories(a.getCategories().stream()
                                .map(c -> c.getName())
                                .toList())
                        .build())
                .toList();


        /* 4) 최신 뉴스 20개 */
        List<HotIssueDto> latestIssues = articleRepository.findAll().stream()
                .sorted(Comparator.comparing(RssArticleEntity::getPublishedAt).reversed())
                .limit(20)
                .map(a -> HotIssueDto.builder()
                        .articleId(a.getId())
                        .title(a.getTitle())
                        .aiTitle(getDisplayTitle(a))          // ★ AI 제목
                        .thumbnail(a.getThumbnailUrl())
                        .publishedAt(a.getPublishedAt())
                        .categories(a.getCategories().stream()
                                .map(c -> c.getName())
                                .toList())
                        .build())
                .toList();


        /* 5) AI 배너 */
        AiBannerDto banner = null;

        ArticleAiTitleEntity latestAi = aiTitleRepository.findAll().stream()
                .filter(a -> a.getAiTitle() != null)
                .max(Comparator.comparing(ArticleAiTitleEntity::getUpdatedAt))
                .orElse(null);

        if (latestAi != null) {
            RssArticleEntity article = latestAi.getArticle();
            banner = AiBannerDto.builder()
                    .articleId(article.getId())
                    .aiTitle(latestAi.getAiTitle())
                    .thumbnail(article.getThumbnailUrl())
                    .build();
        }


        return HomeResponse.builder()
                .newsSlides(newsSlides)
                .topVotes(topVotes)
                .hotIssues(hotIssues)
                .latestIssues(latestIssues)
                .aiBanner(banner)
                .build();
    }
}