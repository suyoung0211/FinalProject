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
import org.usyj.makgora.dto.home.VoteListDto;
import org.usyj.makgora.entity.ArticleAiTitleEntity;
import org.usyj.makgora.entity.RssArticleEntity;
import org.usyj.makgora.entity.VoteEntity;
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


    /* 2) 🔥 핫이슈 (썸네일 있고 최근 기사 위주 Top 12) */
    List<HotIssueDto> hotIssues = articleRepository.findAll().stream()
            .filter(a -> a.getThumbnailUrl() != null)
            .sorted(Comparator.comparing(RssArticleEntity::getPublishedAt).reversed())
            .limit(20)
            .map(a -> HotIssueDto.builder()
                    .id(a.getId())
                    .articleId(a.getId())
                    .title(a.getTitle())
                    .aiTitle(getDisplayTitle(a))
                    .thumbnail(a.getThumbnailUrl())
                    .publishedAt(a.getPublishedAt())
                    .categories(a.getCategories().stream().map(c -> c.getName()).toList())
                    .build())
            .toList();


    /* 3) 최신 뉴스 20개 */
    List<HotIssueDto> latestIssues = articleRepository.findAll().stream()
            .sorted(Comparator.comparing(RssArticleEntity::getPublishedAt).reversed())
            .limit(20)
            .map(a -> HotIssueDto.builder()
                    .id(a.getId())
                    .articleId(a.getId())
                    .title(a.getTitle())
                    .aiTitle(getDisplayTitle(a))
                    .thumbnail(a.getThumbnailUrl())
                    .publishedAt(a.getPublishedAt())
                    .categories(a.getCategories().stream().map(c -> c.getName()).toList())
                    .build())
            .toList();


    /* 4) 투표 목록 */
    List<VoteListDto> aiVotes = voteRepository.findAll().stream()
            .sorted(Comparator.comparing(VoteEntity::getTotalParticipants).reversed())
            .limit(10)
            .map(v -> VoteListDto.builder()
                    .voteId(v.getId())
                    .title(v.getTitle())
                    .status(v.getStatus().name())
                    .endAt(v.getEndAt())
                    .totalPoints(v.getTotalPoints())
                    .totalParticipants(v.getTotalParticipants())
                    .build())
            .toList();


    return HomeResponse.builder()
            .newsSlides(newsSlides)
            .hotIssues(hotIssues)       // ✔ 복구됨
            .latestIssues(latestIssues)
            .voteList(aiVotes)
            .build();
}
}