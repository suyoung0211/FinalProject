package org.usyj.makgora.service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.usyj.makgora.dto.AiBannerDto;
import org.usyj.makgora.dto.HotIssueDto;
import org.usyj.makgora.dto.TopVoteDto;

import org.usyj.makgora.response.HomeResponse;

import org.usyj.makgora.entity.ArticleAiTitleEntity;
import org.usyj.makgora.entity.RssArticleEntity;

import org.usyj.makgora.repository.ArticleAiTitleRepository;
import org.usyj.makgora.repository.VoteRepository;

import org.usyj.makgora.rssfeed.repository.RssArticleRepository;

@Service
@RequiredArgsConstructor
public class HomeService {

    private final VoteRepository voteRepository;
    private final RssArticleRepository articleRepository;
    private final ArticleAiTitleRepository aiTitleRepository;

    public HomeResponse getHomeData() {

        // 1) TOP3 투표
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
    .collect(Collectors.toList());


        // 2) 핫이슈 (최근 24시간)
        LocalDateTime limit = LocalDateTime.now().minusDays(1);

        List<RssArticleEntity> recentArticles =
                articleRepository.findAll().stream()
                        .filter(a -> a.getPublishedAt() != null && a.getPublishedAt().isAfter(limit))
                        .toList();

        List<HotIssueDto> hotIssues = recentArticles.stream()
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

        // 3) AI 배너
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

        return HomeResponse.builder()
                .topVotes(topVotes)
                .hotIssues(hotIssues)
                .aiBanner(banner)
                .build();
    }
}
