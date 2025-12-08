package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.*;
import org.usyj.makgora.repository.*;
import org.usyj.makgora.response.voteDetails.*;
import org.usyj.makgora.rssfeed.repository.ArticleAiTitleRepository;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VoteDetailService {

    private final VoteRepository voteRepository;
    private final VoteOptionRepository voteOptionRepository;
    private final VoteOptionChoiceRepository voteOptionChoiceRepository;

    private final VoteTrendHistoryRepository trendRepository;
    private final VoteUserRepository voteUserRepository;

    private final VoteCommentRepository voteCommentRepository;

    private final ArticleRepository articleRepository;
    private final ArticleAiTitleRepository aiTitleRepository;

    /* =======================================================
 * Main Entry: Vote Detail Response Root  (최신 완전본)
 * ======================================================= */
public VoteDetailMainResponse getVoteDetail(Integer voteId, Integer userId) {

    VoteEntity vote = voteRepository.findById(voteId)
            .orElseThrow(() -> new RuntimeException("Vote not found"));

    // 1) 세부 데이터 로딩
    VoteDetailArticleResponse article = loadArticle(vote);
    List<VoteDetailOptionResponse> options = loadOptions(voteId, userId);
    VoteDetailOddsResponse odds = loadOdds(voteId);
    VoteDetailStatisticsResponse statistics = loadStatistics(voteId);
    VoteDetailParticipationResponse myParticipation = loadMyParticipation(voteId, userId);
    List<VoteDetailCommentResponse> comments = loadComments(voteId);

    // 2) 전체 포인트/참여자 합계
    long totalPoints = options.stream()
            .mapToLong(o -> o.getTotalPoints() != null ? o.getTotalPoints() : 0L)
            .sum();

    int totalParticipants = options.stream()
            .mapToInt(o -> o.getTotalParticipants() != null ? o.getTotalParticipants() : 0)
            .sum();

    // 3) 정답 정보
    Integer correctChoiceId = (vote.getCorrectChoice() != null)
            ? vote.getCorrectChoice().getId().intValue()
            : null;

    boolean isResolved = (vote.getStatus() == VoteEntity.Status.RESOLVED
            || vote.getStatus() == VoteEntity.Status.REWARDED);

    boolean isRewarded = Boolean.TRUE.equals(vote.getRewarded());

    // 4) 정산 요약 정보 (간단 버전)
    VoteDetailSettlementSummaryResponse settlementSummary = null;

    if (isResolved && vote.getCorrectChoice() != null) {

        int totalPool = vote.getOptions().stream()
                .flatMap(opt -> opt.getChoices().stream())
                .mapToInt(c -> c.getPointsTotal() == null ? 0 : c.getPointsTotal())
                .sum();

        int winnerPool = vote.getCorrectChoice().getPointsTotal() == null
                ? 0
                : vote.getCorrectChoice().getPointsTotal();

        int winnerCount = voteUserRepository.countByVote_IdAndChoice_Id(
                voteId, vote.getCorrectChoice().getId()
        );

        settlementSummary = VoteDetailSettlementSummaryResponse.builder()
                .totalPool(totalPool)
                .winnerPool(winnerPool)
                .winnerCount(winnerCount)
                .distributedPoints(null)   // 정산 시 VoteSettlementService에서 채워도 됨
                .averageOdds(null)
                .loserCount(null)
                .build();
    }

    // 5) Root 레벨 expectedOdds/expectedReward
    Double rootExpectedOdds = myParticipation != null ? myParticipation.getExpectedOdds() : null;
    Integer rootExpectedReward = myParticipation != null ? myParticipation.getExpectedReward() : null;

    // 6) 최종 Response 조립
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

            .correctChoiceId(correctChoiceId)
            .isResolved(isResolved)
            .isRewarded(isRewarded)

            .article(article)
            .options(options)
            .odds(odds)
            .statistics(statistics)
            .myParticipation(myParticipation)
            .comments(comments)

            .bettors(Collections.emptyList())
            .settlementSummary(settlementSummary)
            .activityLog(Collections.emptyList())

            .expectedOdds(rootExpectedOdds)
            .expectedReward(rootExpectedReward)
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
     * 2) 옵션 + 선택지 로딩 (+ odds + isMyChoice + percent)
     * ======================================================= */
    private List<VoteDetailOptionResponse> loadOptions(Integer voteId, Integer userId) {

        List<VoteOptionEntity> options =
                voteOptionRepository.findByVoteId(voteId.longValue());

        // 유저가 어떤 choice에 참여했는지 추적
        AtomicReference<Long> myChoiceRef = new AtomicReference<>(null);

        if (userId != null) {
            voteUserRepository.findByUserIdAndVoteId(userId, voteId)
                    .ifPresent(vu -> myChoiceRef.set(vu.getChoice().getId()));
        }

        return options.stream().map(opt -> {

            List<VoteOptionChoiceEntity> choiceEntities = opt.getChoices();

            int optionTotalParticipants = choiceEntities.stream()
                    .mapToInt(c -> c.getParticipantsCount() == null ? 0 : c.getParticipantsCount())
                    .sum();

            long optionTotalPoints = choiceEntities.stream()
                    .mapToLong(c -> c.getPointsTotal() == null ? 0L : c.getPointsTotal())
                    .sum();

            // -------- 선택지 리스트 구성 --------
            List<VoteDetailChoiceResponse> choices = choiceEntities.stream()
                    .map(c -> {

                        int participants = c.getParticipantsCount() == null ? 0 : c.getParticipantsCount();
                        long points = c.getPointsTotal() == null ? 0L : c.getPointsTotal();

                        // marketShare = 포인트 비율
                        double marketShare = 0.0;
                        if (optionTotalPoints > 0) {
                            marketShare =
                                    Math.round(points * 1000.0 / optionTotalPoints) / 10.0; // 소수점 1자리
                        }

                        // 퍼센트 = 참여자 기준
                        double percent = calcPercentByParticipants(c, choiceEntities);

                        // odds 기본값 처리
                        double odds = (c.getOdds() != null && c.getOdds() > 0)
                                ? c.getOdds()
                                : 1.0;

                        return VoteDetailChoiceResponse.builder()
                                .choiceId(c.getId().intValue())
                                .text(c.getChoiceText())
                                .participantsCount(participants)
                                .pointsTotal(points)
                                .percent(percent)
                                .marketShare(marketShare)
                                .odds(odds)
                                .isMyChoice(
                                        myChoiceRef.get() != null &&
                                        myChoiceRef.get().equals(c.getId())
                                )
                                .build();
                    })
                    .toList();

            return VoteDetailOptionResponse.builder()
                    .optionId(opt.getId().intValue())
                    .title(opt.getOptionTitle())
                    .totalParticipants(optionTotalParticipants)
                    .totalPoints(optionTotalPoints)
                    .choices(choices)
                    .build();

        }).toList();
    }

    /* 인원 기준 percent 계산 */
    private double calcPercentByParticipants(
            VoteOptionChoiceEntity choice,
            List<VoteOptionChoiceEntity> allChoices
    ) {
        int total = allChoices.stream()
                .mapToInt(c -> c.getParticipantsCount() == null ? 0 : c.getParticipantsCount())
                .sum();

        if (total == 0) return 0.0;

        int my = choice.getParticipantsCount() == null ? 0 : choice.getParticipantsCount();

        return Math.round(my * 1000.0 / total) / 10.0;  // 소수점 1자리
    }

    /* =======================================================
     * 3) Odds (배당률 + history는 일단 빈 리스트)
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
                        .odds(c.getOdds() != null && c.getOdds() > 0 ? c.getOdds() : 1.0)
                        .history(List.of()) // history는 나중에 trend 기반으로 채워도 됨
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

        if (history.isEmpty()) {
            return VoteDetailStatisticsResponse.builder()
                    .changes(List.of())
                    .build();
        }

        // 시간순 정렬
        history.sort(Comparator.comparing(VoteTrendHistoryEntity::getRecordedAt));

        // recordedAt 기준으로 그룹핑
        Map<LocalDateTime, List<VoteTrendHistoryEntity>> grouped =
                history.stream().collect(Collectors.groupingBy(
                        VoteTrendHistoryEntity::getRecordedAt,
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        List<VoteDetailStatisticsResponse.TrendSnapshot> snapshots = new ArrayList<>();

        for (Map.Entry<LocalDateTime, List<VoteTrendHistoryEntity>> entry : grouped.entrySet()) {

            LocalDateTime time = entry.getKey();
            List<VoteTrendHistoryEntity> list = entry.getValue();

            List<VoteDetailStatisticsResponse.OptionTrendItem> optionTrends =
                    list.stream()
                            .map(h -> VoteDetailStatisticsResponse.OptionTrendItem.builder()
                                    .choiceId(h.getChoice().getId().intValue())
                                    .text(h.getChoice().getChoiceText())
                                    .percent(h.getPercent())
                                    .build())
                            .toList();

            snapshots.add(
                    VoteDetailStatisticsResponse.TrendSnapshot.builder()
                            .timestamp(time.toString())
                            .optionTrends(optionTrends)
                            .build()
            );
        }

        return VoteDetailStatisticsResponse.builder()
                .changes(snapshots)
                .build();
    }

    /* =======================================================
     * 5) 내 참여 정보 (User Bet) + 예상 배당/보상
     * ======================================================= */
    private VoteDetailParticipationResponse loadMyParticipation(Integer voteId, Integer userId) {

        if (userId == null) {
            return VoteDetailParticipationResponse.builder()
                    .hasParticipated(false)
                    .build();
        }

        return voteUserRepository.findByUserIdAndVoteId(userId, voteId)
                .map(v -> {

                    VoteOptionChoiceEntity choice = v.getChoice();
                    Double odds = choice.getOdds();
                    Integer pointsBet = v.getPointsBet();

                    Double expectedOdds = odds;
                    Integer expectedReward = null;
                    if (odds != null && pointsBet != null) {
                        expectedReward = (int) Math.floor(pointsBet * odds);
                    }

                    return VoteDetailParticipationResponse.builder()
                            .hasParticipated(true)
                            .optionId(v.getOption().getId().intValue())
                            .choiceId(choice.getId().intValue())
                            .pointsBet(pointsBet)
                            .votedAt(v.getCreatedAt())
                            .expectedOdds(expectedOdds)
                            .expectedReward(expectedReward)
                            .build();
                })
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

    List<VoteCommentEntity> rootComments =
            voteCommentRepository.findByVote_IdAndParentIsNull(voteId);

    return rootComments.stream()
            .map(this::convertCommentTree)
            .toList();
}

    private VoteDetailCommentResponse convertCommentTree(VoteCommentEntity c) {

    List<VoteDetailCommentResponse> childDtos =
            c.getChildren() == null
                    ? List.of()
                    : c.getChildren().stream()
                    .map(this::convertCommentTree)
                    .toList();

    Integer likeCount = (c.getLikeCount() != null) ? c.getLikeCount() : 0;
    Integer dislikeCount = (c.getDislikeCount() != null) ? c.getDislikeCount() : 0;

    Integer linkedChoiceId = (c.getChoice() != null)
            ? c.getChoice().getId().intValue()
            : null;

    return VoteDetailCommentResponse.builder()
            .commentId(c.getCommentId().intValue())
            .voteId(c.getVote() != null ? c.getVote().getId() : null)

            .userId(c.getUser().getId())
            .username(c.getUser().getNickname())
            .userPosition(c.getUserPosition())

            .position(c.getPosition())
            .content(c.getContent())

            .createdAt(c.getCreatedAt())
            .updatedAt(c.getUpdatedAt())

            .parentId(c.getParent() != null ? c.getParent().getCommentId().intValue() : null)
            .children(childDtos)

            .likeCount(likeCount)
            .dislikeCount(dislikeCount)
            .myLike(false)
            .myDislike(false)

            .linkedChoiceId(linkedChoiceId)
            .build();
}


    /* =======================================================
     * 7) 내 참여 정보만 단독 조회용 ( /api/votes/{id}/my )
     * ======================================================= */
    public MyParticipationResponse getMyParticipationOnly(Integer voteId, Integer userId) {
        return voteUserRepository.findByUserIdAndVoteId(userId, voteId)
                .map(v -> MyParticipationResponse.builder()
                        .hasParticipated(true)
                        .isCancelled(Boolean.TRUE.equals(v.getIsCancelled()))
                        .optionId(v.getOption().getId().intValue())
                        .choiceId(v.getChoice().getId().intValue())
                        .pointsBet(v.getPointsBet().longValue())
                        .votedAt(v.getCreatedAt())
                        .canceledAt(Boolean.TRUE.equals(v.getIsCancelled()) ? v.getUpdatedAt() : null)
                        .build()
                )
                .orElse(
                        MyParticipationResponse.builder()
                                .hasParticipated(false)
                                .isCancelled(false)
                                .build()
                );
    }
}
