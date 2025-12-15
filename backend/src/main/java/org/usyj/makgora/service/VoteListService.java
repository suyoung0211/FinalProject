package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.usyj.makgora.entity.*;
import org.usyj.makgora.repository.*;
import org.usyj.makgora.response.voteDetails.*;
import org.usyj.makgora.rssfeed.repository.ArticleAiTitleRepository;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VoteListService {

    private final VoteRepository voteRepository;
    private final VoteOptionRepository voteOptionRepository;
    private final VoteUserRepository voteUserRepository;
    private final VoteTrendHistoryRepository trendRepository;
    private final VoteCommentRepository voteCommentRepository;
    private final ArticleAiTitleRepository aiTitleRepository;

    /* =======================================================
     * Main Entry
     * ======================================================= */
    public VoteDetailMainResponse getVoteDetail(Integer voteId, Integer userId) {

        VoteEntity vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Vote not found: " + voteId));

        VoteDetailArticleResponse article = loadArticle(vote);
        List<VoteDetailOptionResponse> options = loadOptions(voteId, userId);
        VoteDetailOddsResponse odds = loadOdds(voteId);
        VoteDetailStatisticsResponse statistics = loadStatistics(voteId);
        VoteDetailParticipationResponse myParticipation = loadMyParticipation(voteId, userId);
        List<VoteDetailCommentResponse> comments = loadComments(voteId);

        long totalPoints = options.stream()
                .mapToLong(o -> o.getTotalPoints() == null ? 0L : o.getTotalPoints())
                .sum();

        int totalParticipants = options.stream()
                .mapToInt(o -> o.getTotalParticipants() == null ? 0 : o.getTotalParticipants())
                .sum();

        return VoteDetailMainResponse.builder()
                .voteId(voteId)
                .type("AI")
                .title(vote.getTitle())
                .description(vote.getAiProgressSummary())
                .category(vote.getIssue() != null ? vote.getIssue().getTitle() : null)
                .status(vote.getStatus().name())
                .createdAt(vote.getCreatedAt())
                .endAt(vote.getEndAt())
                .totalPoints(totalPoints)
                .totalParticipants(totalParticipants)
                .article(article)
                .options(options)
                .odds(odds)
                .statistics(statistics)
                .myParticipation(myParticipation)
                .comments(comments)
                .build();
    }

    private VoteDetailArticleResponse loadArticle(VoteEntity vote) {

    if (vote.getIssue() == null || vote.getIssue().getArticle() == null) {
        return null;
    }

    RssArticleEntity article = vote.getIssue().getArticle();

    String aiTitle = aiTitleRepository.findByArticle(article)
            .map(ArticleAiTitleEntity::getAiTitle)
            .orElse(null);

    return VoteDetailArticleResponse.builder()
            .articleId(article.getId())
            .title(article.getTitle())
            .aiTitle(aiTitle)
            .publisher(
                    article.getFeed() != null
                            ? article.getFeed().getSourceName()
                            : null
            )
            .thumbnailUrl(article.getThumbnailUrl())
            .link(article.getLink())
            .categories(
                    article.getCategories().stream()
                            .map(ArticleCategoryEntity::getName)
                            .toList()
            )
            .publishedAt(article.getPublishedAt())
            .createdAt(article.getCreatedAt())
            .viewCount(article.getViewCount())
            .likeCount(article.getLikeCount())
            .dislikeCount(article.getDislikeCount())
            .commentCount(article.getCommentCount())
            .build();
}

    /* =======================================================
     * Options + Choices
     * ======================================================= */
    private List<VoteDetailOptionResponse> loadOptions(Integer voteId, Integer userId) {

        List<VoteOptionEntity> options =
                voteOptionRepository.findByVoteId(voteId);

        Long myChoiceId = userId == null ? null :
                voteUserRepository.findByUserIdAndVoteId(userId, voteId)
                        .map(v -> v.getChoice().getId())
                        .orElse(null);

        return options.stream().map(option -> {

            int optionParticipants = option.getParticipantsCount();
            long optionPoints = option.getPointsTotal();
            double optionOdds = option.getOdds();

            List<VoteDetailChoiceResponse> choices =
                    option.getChoices().stream().map(choice -> {

                        double percent = optionParticipants > 0
                                ? Math.round((1000.0 / option.getChoices().size())) / 10.0
                                : 0.0;

                        return VoteDetailChoiceResponse.builder()
                                .choiceId(choice.getId().intValue())
                                .text(choice.getChoiceText())
                                .participantsCount(optionParticipants)
                                .pointsTotal(optionPoints)
                                .percent(percent)
                                .marketShare(percent)
                                .odds(optionOdds)
                                .isMyChoice(
                                        myChoiceId != null &&
                                        myChoiceId.equals(choice.getId())
                                )
                                .build();
                    }).toList();

            return VoteDetailOptionResponse.builder()
                    .optionId(option.getId().intValue())
                    .title(option.getOptionTitle())
                    .totalParticipants(optionParticipants)
                    .totalPoints(optionPoints)
                    .correctChoiceId(
                            option.getCorrectChoice() != null
                                    ? option.getCorrectChoice().getId().intValue()
                                    : null
                    )
                    .choices(choices)
                    .build();
        }).toList();
    }

    /* =======================================================
     * Odds (옵션 기준)
     * ======================================================= */
    private VoteDetailOddsResponse loadOdds(Integer voteId) {

        List<VoteOptionEntity> options =
                voteOptionRepository.findByVoteId(voteId);

        List<VoteDetailOddsResponse.OddsItem> items =
        options.stream()
                .map(o ->
                        VoteDetailOddsResponse.OddsItem.builder()
                                .optionId(o.getId())
                                .optionTitle(o.getOptionTitle())
                                .odds(o.getOdds())   // 옵션 기준 odds
                                .history(List.of()) // 아직 없으면 빈 리스트
                                .build()
                )
                .toList();

        return VoteDetailOddsResponse.builder()
                .voteId(voteId)
                .odds(items)
                .build();
    }

    /* =======================================================
     * Statistics / Trend
     * ======================================================= */
    private VoteDetailStatisticsResponse loadStatistics(Integer voteId) {

        List<VoteTrendHistoryEntity> history =
                trendRepository.findByVoteId(voteId);

        history.sort(Comparator.comparing(VoteTrendHistoryEntity::getRecordedAt));

        return VoteDetailStatisticsResponse.builder()
                .changes(
                        history.stream().map(h ->
                                VoteDetailStatisticsResponse.TrendSnapshot.builder()
                                        .timestamp(h.getRecordedAt().toString())
                                        .optionTrends(List.of(
                                                VoteDetailStatisticsResponse.OptionTrendItem.builder()
                                                        .choiceId(h.getChoice().getId().intValue())
                                                        .text(h.getChoice().getChoiceText())
                                                        .percent(h.getPercent())
                                                        .build()
                                        ))
                                        .build()
                        ).toList()
                )
                .build();
    }

    /* =======================================================
     * My Participation
     * ======================================================= */
    private VoteDetailParticipationResponse loadMyParticipation(Integer voteId, Integer userId) {

        if (userId == null) {
            return VoteDetailParticipationResponse.builder()
                    .hasParticipated(false)
                    .build();
        }

        return voteUserRepository.findByUserIdAndVoteId(userId, voteId)
                .map(v ->
                        VoteDetailParticipationResponse.builder()
                                .hasParticipated(true)
                                .optionId(v.getOption().getId().intValue())
                                .choiceId(v.getChoice().getId().intValue())
                                .pointsBet(v.getPointsBet())
                                .votedAt(v.getCreatedAt())
                                .build()
                )
                .orElse(
                        VoteDetailParticipationResponse.builder()
                                .hasParticipated(false)
                                .build()
                );
    }

    /* =======================================================
     * Comments
     * ======================================================= */
    private List<VoteDetailCommentResponse> loadComments(Integer voteId) {

        return voteCommentRepository.findByVote_IdAndParentIsNull(voteId)
                .stream()
                .map(this::convertComment)
                .toList();
    }

    private VoteDetailCommentResponse convertComment(VoteCommentEntity c) {

        return VoteDetailCommentResponse.builder()
                .commentId(c.getCommentId().intValue())
                .voteId(c.getVote() != null ? c.getVote().getId() : null)
                .userId(c.getUser().getId())
                .username(c.getUser().getNickname())
                .position(c.getPosition())
                .content(c.getContent())
                .userPosition(c.getUserPosition())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .parentId(c.getParent() != null ? c.getParent().getCommentId().intValue() : null)
                .children(
                        c.getChildren().stream()
                                .map(this::convertComment)
                                .toList()
                )
                .build();
    }
}

