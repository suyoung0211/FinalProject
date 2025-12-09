package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.usyj.makgora.entity.*;
import org.usyj.makgora.repository.*;
import org.usyj.makgora.response.voteDetails.*;
import org.usyj.makgora.rssfeed.repository.ArticleAiTitleRepository;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VoteListService {

    private final VoteRepository voteRepository;
    private final VoteOptionRepository voteOptionRepository;
    private final VoteOptionChoiceRepository voteOptionChoiceRepository;

    private final VoteTrendHistoryRepository trendRepository;
    private final VoteUserRepository voteUserRepository;

    private final VoteCommentRepository voteCommentRepository;

    private final ArticleRepository articleRepository;
    private final ArticleAiTitleRepository aiTitleRepository;


    /* =======================================================
     * Main Entry: Vote Detail Response Root
     * ======================================================= */
    public VoteDetailMainResponse getVoteDetail(Integer voteId, Integer userId) {

        VoteEntity vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("Vote not found"));

        // 각각 서브 DTO 로딩
        VoteDetailArticleResponse article = loadArticle(vote);
        List<VoteDetailOptionResponse> options = loadOptions(voteId);
        VoteDetailOddsResponse odds = loadOdds(voteId);
        VoteDetailStatisticsResponse statistics = loadStatistics(voteId);
        VoteDetailParticipationResponse myParticipation = loadMyParticipation(voteId, userId);
        List<VoteDetailCommentResponse> comments = loadComments(voteId);

        // 전체 총합 계산 (옵션들의 총합)
        Long totalPoints = options.stream()
                .mapToLong(o -> o.getTotalPoints() != null ? o.getTotalPoints() : 0L)
                .sum();

        Integer totalParticipants = options.stream()
                .mapToInt(o -> o.getTotalParticipants() != null ? o.getTotalParticipants() : 0)
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

                .totalParticipants(totalParticipants)
                .totalPoints(totalPoints)

                .article(article)
                .options(options)
                .odds(odds)
                .statistics(statistics)
                .myParticipation(myParticipation)
                .comments(comments)
                .build();
    }


    /* =======================================================
     * 1) Article 정보 로딩
     * ======================================================= */
    private VoteDetailArticleResponse loadArticle(VoteEntity vote) {

        if (vote.getIssue() == null || vote.getIssue().getArticle() == null)
            return null;

        RssArticleEntity article = vote.getIssue().getArticle();

        String aiTitle = aiTitleRepository.findByArticle(article)
                .map(ArticleAiTitleEntity::getAiTitle)
                .orElse(null);

        return VoteDetailArticleResponse.builder()
                .articleId(article.getId())
                .title(article.getTitle())
                .aiTitle(aiTitle)
                .publisher(article.getFeed().getSourceName())
                .thumbnailUrl(article.getThumbnailUrl())
                .link(article.getLink())
                .categories(article.getCategories().stream().map(c -> c.getName()).toList())
                .publishedAt(article.getPublishedAt())
                .createdAt(article.getCreatedAt())
                .viewCount(article.getViewCount())
                .likeCount(article.getLikeCount())
                .dislikeCount(article.getDislikeCount())
                .commentCount(article.getCommentCount())
                .build();
    }


    /* =======================================================
     * 2) 옵션 + 선택지 로딩
     * ======================================================= */
    private List<VoteDetailOptionResponse> loadOptions(Integer voteId) {

        List<VoteOptionEntity> options = voteOptionRepository.findByVoteId(voteId.longValue());

        return options.stream().map(opt -> {

            // 모든 선택지
            List<VoteOptionChoiceEntity> choiceEntities = opt.getChoices();

            // choice DTO 변환
            List<VoteDetailChoiceResponse> choices = choiceEntities.stream()
                    .map(c -> VoteDetailChoiceResponse.builder()
                            .choiceId(c.getId().intValue())
                            .text(c.getChoiceText())
                            .participantsCount(c.getParticipantsCount())
                            .pointsTotal(c.getPointsTotal() != null ? c.getPointsTotal().longValue() : 0L)
                            .odds(c.getOdds() != null ? c.getOdds() : 1.0)
                            .percent(calcPercent(c, opt))  // YES/NO 비율 계산
                            .build()
                    ).toList();

            // 옵션 전체 인원 합계
            Integer totalParticipants = choiceEntities.stream()
                    .mapToInt(VoteOptionChoiceEntity::getParticipantsCount)
                    .sum();

            // 옵션 전체 포인트 합
            Long totalPoints = choiceEntities.stream()
                    .mapToLong(c -> c.getPointsTotal() == null ? 0L : c.getPointsTotal())
                    .sum();

            return VoteDetailOptionResponse.builder()
                    .optionId(opt.getId().intValue())
                    .title(opt.getOptionTitle())
                    .totalParticipants(totalParticipants)
                    .totalPoints(totalPoints)
                    .choices(choices)
                    .build();

        }).toList();
    }


    /* 계산: 선택지 퍼센트 */
    private double calcPercent(VoteOptionChoiceEntity choice, VoteOptionEntity option) {

        int total = option.getChoices().stream()
                .mapToInt(VoteOptionChoiceEntity::getParticipantsCount)
                .sum();

        if (total == 0) return 0.0;

        return Math.round((choice.getParticipantsCount() * 100.0 / total) * 10) / 10.0;
    }


    /* =======================================================
     * 3) Odds (배당률)
     * ======================================================= */
    private VoteDetailOddsResponse loadOdds(Integer voteId) {

        List<VoteOptionEntity> options = voteOptionRepository.findByVoteId(voteId.longValue());

        List<VoteOptionChoiceEntity> allChoices = options.stream()
                .flatMap(o -> o.getChoices().stream())
                .collect(Collectors.toList());

        List<VoteDetailOddsResponse.OddsItem> oddsItems = allChoices.stream()
                .map(c -> VoteDetailOddsResponse.OddsItem.builder()
                        .choiceId(c.getId().intValue())
                        .text(c.getChoiceText())
                        .odds(c.getOdds() != null ? c.getOdds() : 1.0)
                        .build())
                .toList();

        return VoteDetailOddsResponse.builder()
                .voteId(voteId)
                .odds(oddsItems)
                .build();
    }


    /* =======================================================
     * 4) Trend Graph (통계 변화)
     * ======================================================= */
    private VoteDetailStatisticsResponse loadStatistics(Integer voteId) {

    List<VoteTrendHistoryEntity> history =
            trendRepository.findByVoteId(voteId);

    history.sort(Comparator.comparing(VoteTrendHistoryEntity::getRecordedAt));

    // 🔥 변경된 구조에 맞게 변환
    List<VoteDetailStatisticsResponse.TrendSnapshot> snapshots =
            history.stream().map(h -> {

                VoteDetailStatisticsResponse.OptionTrendItem item =
                        VoteDetailStatisticsResponse.OptionTrendItem.builder()
                                .choiceId(h.getChoice().getId().intValue())
                                .text(h.getChoice().getChoiceText())
                                .percent(h.getPercent())
                                .build();

                return VoteDetailStatisticsResponse.TrendSnapshot.builder()
                        .timestamp(h.getRecordedAt().toString())
                        .optionTrends(List.of(item))
                        .build();
            }).toList();

    return VoteDetailStatisticsResponse.builder()
            .changes(snapshots)
            .build();
}



    /* =======================================================
     * 5) 내 참여 정보 (User Bet)
     * ======================================================= */
    private VoteDetailParticipationResponse loadMyParticipation(Integer voteId, Integer userId) {

        return voteUserRepository.findByUserIdAndVoteId(userId, voteId)
                .map(v -> VoteDetailParticipationResponse.builder()
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
     * 6) 댓글 로딩 (트리 구조)
     * ======================================================= */
    private List<VoteDetailCommentResponse> loadComments(Integer voteId) {

        List<VoteCommentEntity> comments =
                voteCommentRepository.findByVote_IdAndParentIsNull(voteId);

        return comments.stream()
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
                .children(c.getChildren().stream().map(this::convertComment).toList())
                .build();
    }
}
