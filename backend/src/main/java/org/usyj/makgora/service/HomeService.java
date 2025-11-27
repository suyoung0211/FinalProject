package org.usyj.makgora.service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

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

    public HomeResponse getHomeData() {

        /* -----------------------
           1) 뉴스 슬라이드 (최신 10개)
           ----------------------- */
        List<RssArticleEntity> slideArticles =
                articleRepository.findAll().stream()
                        .filter(a -> a.getThumbnailUrl() != null)
                        .sorted(Comparator.comparing(RssArticleEntity::getPublishedAt).reversed())
                        .limit(10)
                        .toList();

        List<SlideNewsDto> newsSlides = slideArticles.stream()
                .map(a -> {
                    Optional<ArticleAiTitleEntity> ai =
                            aiTitleRepository.findByArticleAndModelName(a, "default");

                    return SlideNewsDto.builder()
                            .articleId(a.getId())
                            .aiTitle(ai.map(ArticleAiTitleEntity::getAiTitle).orElse(a.getTitle()))
                            .thumbnail(a.getThumbnailUrl())
                            .publishedAt(a.getPublishedAt())
                            .build();
                })
                .toList();


        /* -----------------------
           2) TOP3 투표 (기존)
           ----------------------- */
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


        /* -----------------------
           3) 최근 24시간 핫이슈
           ----------------------- */
        LocalDateTime limit = LocalDateTime.now().minusDays(1);

        List<HotIssueDto> hotIssues = articleRepository.findAll().stream()
                .filter(a -> a.getPublishedAt() != null && a.getPublishedAt().isAfter(limit))
                .map(article -> {
                    Optional<ArticleAiTitleEntity> ai =
                            aiTitleRepository.findByArticleAndModelName(article, "default");

                    return HotIssueDto.builder()
                            .articleId(article.getId())
                            .title(article.getTitle())
                            .aiTitle(ai.map(ArticleAiTitleEntity::getAiTitle).orElse(null))
                            .thumbnail(article.getThumbnailUrl())
                            .publishedAt(article.getPublishedAt())
                            .categories(
                                    article.getCategories()
                                            .stream()
                                            .map(c -> c.getName())
                                            .toList()
                            )
                            .build();
                })
                .toList();


        /* -----------------------
           4) 최신 뉴스 20개
           ----------------------- */
        List<HotIssueDto> latestIssues =
                articleRepository.findAll().stream()
                        .sorted(Comparator.comparing(RssArticleEntity::getPublishedAt).reversed())
                        .limit(20)
                        .map(article -> {
                            Optional<ArticleAiTitleEntity> ai =
                                    aiTitleRepository.findByArticleAndModelName(article, "default");

                            return HotIssueDto.builder()
                                    .articleId(article.getId())
                                    .title(article.getTitle())
                                    .aiTitle(ai.map(ArticleAiTitleEntity::getAiTitle).orElse(null))
                                    .thumbnail(article.getThumbnailUrl())
                                    .publishedAt(article.getPublishedAt())
                                    .categories(
                                            article.getCategories()
                                                    .stream()
                                                    .map(c -> c.getName())
                                                    .toList()
                                    )
                                    .build();
                        })
                        .toList();


        /* -----------------------
           5) AI 배너 (최신 AI요약)
           ----------------------- */
        AiBannerDto banner = null;

        Optional<ArticleAiTitleEntity> latestAi =
                aiTitleRepository.findAll().stream()
                        .filter(a -> a.getAiTitle() != null)
                        .max(Comparator.comparing(ArticleAiTitleEntity::getUpdatedAt));

        if (latestAi.isPresent()) {
            RssArticleEntity article = latestAi.get().getArticle();
            banner = AiBannerDto.builder()
                    .articleId(article.getId())
                    .aiTitle(latestAi.get().getAiTitle())
                    .thumbnail(article.getThumbnailUrl())
                    .build();
        }


        /* -----------------------
           최종 응답
           ----------------------- */
        return HomeResponse.builder()
                .newsSlides(newsSlides)      // 추가됨
                .topVotes(topVotes)
                .hotIssues(hotIssues)
                .latestIssues(latestIssues)  // 추가됨
                .aiBanner(banner)
                .build();
    }
}
