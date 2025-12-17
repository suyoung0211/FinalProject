package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.article.entity.ArticleAiTitleEntity;
import org.usyj.makgora.article.entity.ArticleCategoryEntity;
import org.usyj.makgora.article.entity.RssArticleEntity;
import org.usyj.makgora.article.repository.ArticleAiTitleRepository;
import org.usyj.makgora.ranking.entity.*;
import org.usyj.makgora.repository.*;
import org.usyj.makgora.response.VoteTrendChartResponse;
import org.usyj.makgora.response.vote.OddsResponse;
import org.usyj.makgora.response.voteDetails.*;
import org.usyj.makgora.vote.entity.VoteCommentEntity;
import org.usyj.makgora.vote.entity.VoteEntity;
import org.usyj.makgora.vote.entity.VoteOptionChoiceEntity;
import org.usyj.makgora.vote.entity.VoteOptionEntity;
import org.usyj.makgora.vote.entity.VoteTrendHistoryEntity;
import org.usyj.makgora.vote.entity.VoteUserEntity;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VoteDetailService {

    private final VoteRepository voteRepository;
    private final VoteOptionRepository voteOptionRepository;
    private final VoteUserRepository voteUserRepository;
    private final VoteTrendHistoryRepository trendRepository;
    private final VoteCommentRepository voteCommentRepository;
    private final ArticleAiTitleRepository aiTitleRepository;
    private final OddsService oddsService;

    private static final double MAX_ODDS = 10.0;
    private static final double FEE_RATE = 0.01;

    /* =======================================================
     * Main Entry
     * ======================================================= */
    public VoteDetailMainResponse getVoteDetail(Integer voteId, Integer userId) {

        VoteEntity vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("Vote not found"));

        List<VoteOptionEntity> options =
                voteOptionRepository.findByVoteId(vote.getId());

        List<VoteUserEntity> validBets =
                voteUserRepository.findByVoteId(vote.getId()).stream()
                        .filter(vu -> !Boolean.TRUE.equals(vu.getIsCancelled()))
                        .toList();

        VoteDetailArticleResponse article = loadArticle(vote);
        OddsResponse oddsResponse = oddsService.getCurrentOdds(voteId);
        VoteDetailOddsResponse odds = VoteDetailOddsResponse.builder()
        .voteId(voteId) // ✅ 추가
        .odds(
                oddsResponse.getOptions().stream()
                        .map(o -> VoteDetailOddsResponse.OddsItem.builder()
                                .optionId(o.getOptionId())
                                .optionTitle(
                                        options.stream()
                                                .filter(opt -> opt.getId().intValue() == o.getOptionId())
                                                .map(VoteOptionEntity::getOptionTitle)
                                                .findFirst()
                                                .orElse(null)
                                ) // ✅ 추가
                                .odds(o.getOdds())
                                .history(List.of())
                                .build())
                        .toList()
        )
        .build();
        List<VoteDetailOptionResponse> optionResponses =
        loadOptions(options, validBets, userId, odds);
        VoteDetailStatisticsResponse statistics = loadStatistics(voteId);
        VoteDetailParticipationResponse myParticipation =
                loadMyParticipation(validBets, userId);
        List<VoteDetailCommentResponse> comments = loadComments(voteId);

        long totalPoints = validBets.stream()
                .mapToLong(v -> v.getPointsBet() == null ? 0 : v.getPointsBet())
                .sum();

        int totalParticipants = (int) validBets.stream()
                .map(v -> v.getUser().getId())
                .distinct()
                .count();

        Map<Integer, Integer> correctChoicesByOption =
                options.stream()
                        .filter(o -> o.getCorrectChoice() != null)
                        .collect(Collectors.toMap(
                                o -> o.getId().intValue(),
                                o -> o.getCorrectChoice().getId().intValue()
                        ));

        boolean isResolved =
                vote.getStatus() == VoteEntity.Status.RESOLVED
             || vote.getStatus() == VoteEntity.Status.REWARDED;

        boolean isRewarded = Boolean.TRUE.equals(vote.getRewarded());

        VoteDetailSettlementSummaryResponse settlementSummary =
                isResolved ? buildSettlementSummary(validBets, vote) : null;

        return VoteDetailMainResponse.builder()
                .voteId(voteId)
                .type("AI")
                .title(vote.getTitle())
                .description(vote.getAiProgressSummary())
                .category(
                        vote.getIssue() != null
                                ? vote.getIssue().getTitle()
                                : null
                )
                .status(vote.getStatus().name())
                .createdAt(vote.getCreatedAt())
                .endAt(vote.getEndAt())
                .totalParticipants(totalParticipants)
                .totalPoints(totalPoints)

                .correctChoicesByOption(correctChoicesByOption)
                .isResolved(isResolved)
                .isRewarded(isRewarded)

                .article(article)
                .options(optionResponses)
                .odds(odds)
                .statistics(statistics)
                .myParticipation(myParticipation)
                .comments(comments)

                .bettors(Collections.emptyList())
                .activityLog(Collections.emptyList())
                .settlementSummary(settlementSummary)

                .expectedOdds(
                        myParticipation != null
                                ? myParticipation.getExpectedOdds()
                                : null
                )
                .expectedReward(
                        myParticipation != null
                                ? myParticipation.getExpectedReward()
                                : null
                )
                .build();
    }

    /* =======================================================
     * Odds (Option 기준)
     * ======================================================= */
    private List<VoteDetailOptionResponse> loadOptions(
        List<VoteOptionEntity> options,
        List<VoteUserEntity> bets,
        Integer userId,
        VoteDetailOddsResponse odds // ✅ optionOddsMap 만들려고 추가
) {
    // ✅ optionId -> odds map
    Map<Long, Double> optionOddsMap = new HashMap<>();
    if (odds != null && odds.getOdds() != null) {
        for (var item : odds.getOdds()) {
            if (item.getOptionId() != null) {
                optionOddsMap.put(item.getOptionId().longValue(),
                        item.getOdds() != null ? item.getOdds() : 1.0);
            }
        }
    }

    Integer myChoiceId = bets.stream()
            .filter(v -> userId != null && v.getUser().getId().equals(userId))
            .map(v -> v.getChoice() != null ? v.getChoice().getId().intValue() : null)
            .findFirst()
            .orElse(null);

    return options.stream().map(opt -> {

        // ✅ 해당 option에 속한 bets만
        List<VoteUserEntity> optionBets = bets.stream()
                .filter(v -> v.getOption() != null
                        && Objects.equals(v.getOption().getId(), opt.getId()))

                .toList();

        int totalParticipants = (int) optionBets.stream()
                .map(v -> v.getUser().getId())
                .distinct()
                .count();

        long totalPoints = optionBets.stream()
                .mapToLong(v -> v.getPointsBet() == null ? 0 : v.getPointsBet())
                .sum();

        // ✅ choice별 집계 (participantsCount, pointsTotal)
        Map<Long, Long> choicePoints =
        optionBets.stream()
                .filter(v -> v.getChoice() != null)
                .collect(Collectors.groupingBy(
                        v -> v.getChoice().getId().longValue(), // 🔥 핵심
                        Collectors.summingLong(
                                v -> v.getPointsBet() == null ? 0 : v.getPointsBet()
                        )
                ));

        Map<Long, Long> choiceUsers =
        optionBets.stream()
                .filter(v -> v.getChoice() != null)
                .collect(Collectors.groupingBy(
                        v -> v.getChoice().getId().longValue(), // 🔥 Long 통일
                        Collectors.mapping(
                                v -> v.getUser().getId(),          // Integer OK
                                Collectors.toSet()
                        )
                ))
                .entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> (long) e.getValue().size()
                ));

        final double optionOdds = Math.max(
        1.0,
        Math.min(
                MAX_ODDS,
                opt.getVote().getStatus() == VoteEntity.Status.REWARDED
                        ? (opt.getOdds() != null ? opt.getOdds() : 1.0)
                        : optionOddsMap.getOrDefault(opt.getId().longValue(), 1.0)
        )
);

        double feeRate = Optional.ofNullable(opt.getVote().getFeeRate()).orElse(0.0);

        List<VoteDetailChoiceResponse> choices = opt.getChoices().stream().map(c -> {

            long cParticipants =
                choiceUsers.getOrDefault(c.getId().longValue(), 0L);
            long cPoints =
                choicePoints.getOrDefault(c.getId().longValue(), 0L);

            double percent = totalParticipants == 0
                    ? 0.0
                    : Math.round(cParticipants * 1000.0 / totalParticipants) / 10.0;
        
                // ✅ 🔥 여기서 choiceOdds 계산
    final double choiceOdds =
            cPoints > 0
                    ? Math.min(
                          MAX_ODDS,
                          Math.max(
                              1.0,
                              (double) totalPoints * (1.0 - feeRate) / cPoints
                          )
                      )
                    : MAX_ODDS;

            return VoteDetailChoiceResponse.builder()
                    .choiceId(c.getId().intValue())
                    .text(c.getChoiceText())
                    .participantsCount((int) cParticipants)
                    .pointsTotal(cPoints)
                    .percent(percent)
                    .marketShare(percent)
                    .odds(choiceOdds) // ✅ ONGOING에서도 실시간 odds 주입
                    .isMyChoice(myChoiceId != null && myChoiceId.equals(c.getId().intValue()))
                    .isCorrect(null)
                    .build();
        }).toList();

        return VoteDetailOptionResponse.builder()
                .optionId(opt.getId().intValue())
                .title(opt.getOptionTitle())
                .totalParticipants(totalParticipants)
                .totalPoints(totalPoints)
                .correctChoiceId(opt.getCorrectChoice() != null ? opt.getCorrectChoice().getId().intValue() : null)
                .choices(choices)
                .trend(List.of())
                .build();
    }).toList();
}


    /* =======================================================
     * Statistics (Trend)
     * ======================================================= */
    private VoteDetailStatisticsResponse loadStatistics(Integer voteId) {

        List<VoteTrendHistoryEntity> history =
                trendRepository.findByVoteId(voteId);

        if (history.isEmpty()) {
            return VoteDetailStatisticsResponse.builder()
                    .changes(List.of())
                    .build();
        }

        history.sort(Comparator.comparing(VoteTrendHistoryEntity::getRecordedAt));

        Map<LocalDateTime, List<VoteTrendHistoryEntity>> grouped =
                history.stream().collect(Collectors.groupingBy(
                        VoteTrendHistoryEntity::getRecordedAt,
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        List<VoteDetailStatisticsResponse.TrendSnapshot> snapshots = new ArrayList<>();

        for (var entry : grouped.entrySet()) {

            List<VoteDetailStatisticsResponse.OptionTrendItem> items =
                    entry.getValue().stream()
                            .map(h ->
                                    VoteDetailStatisticsResponse.OptionTrendItem.builder()
                                            .choiceId(
                                                    h.getChoice() != null
                                                            ? h.getChoice().getId().intValue()
                                                            : null
                                            )
                                            .text(
                                                    h.getChoice() != null
                                                            ? h.getChoice().getChoiceText()
                                                            : null
                                            )
                                            .percent(h.getPercent())
                                            .build()
                            )
                            .toList();

            snapshots.add(
                    VoteDetailStatisticsResponse.TrendSnapshot.builder()
                            .timestamp(entry.getKey().toString())
                            .optionTrends(items)
                            .build()
            );
        }

        return VoteDetailStatisticsResponse.builder()
                .changes(snapshots)
                .build();
    }

    /* =======================================================
     * My Participation
     * ======================================================= */
    private VoteDetailParticipationResponse loadMyParticipation(
            List<VoteUserEntity> bets,
            Integer userId
    ) {
        if (userId == null) {
            return VoteDetailParticipationResponse.builder()
                    .hasParticipated(false)
                    .build();
        }

        return bets.stream()
                .filter(v -> v.getUser().getId().equals(userId))
                .findFirst()
                .map(v ->
                        VoteDetailParticipationResponse.builder()
                                .hasParticipated(true)
                                .optionId(v.getOption().getId().intValue())
                                .choiceId(
                                        v.getChoice() != null
                                                ? v.getChoice().getId().intValue()
                                                : null
                                )
                                .pointsBet(v.getPointsBet())
                                .votedAt(v.getCreatedAt())
                                .expectedOdds(v.getOddsAtBet())
                                .expectedReward(
                                        v.getOddsAtBet() != null && v.getPointsBet() != null
                                                ? (int) Math.floor(
                                                        v.getPointsBet() * v.getOddsAtBet()
                                                )
                                                : null
                                )
                                .build()
                )
                .orElse(
                        VoteDetailParticipationResponse.builder()
                                .hasParticipated(false)
                                .build()
                );
    }

    /* =======================================================
     * Settlement Summary
     * ======================================================= */
    private VoteDetailSettlementSummaryResponse buildSettlementSummary(
            List<VoteUserEntity> bets,
            VoteEntity vote
    ) {

        int totalPool = bets.stream()
                .mapToInt(v -> v.getPointsBet() == null ? 0 : v.getPointsBet())
                .sum();

        Set<Integer> correctChoiceIds =
                vote.getOptions().stream()
                        .filter(o -> o.getCorrectChoice() != null)
                        .map(o -> o.getCorrectChoice().getId())
                        .collect(Collectors.toSet());

        List<VoteUserEntity> winners =
                bets.stream()
                        .filter(v ->
                                v.getChoice() != null &&
                                correctChoiceIds.contains(v.getChoice().getId())
                        )
                        .toList();

        int winnerPool = winners.stream()
                .mapToInt(v -> v.getPointsBet() == null ? 0 : v.getPointsBet())
                .sum();

        int winnerCount = winners.size();
        int loserCount = Math.max(0, bets.size() - winnerCount);

        Double averageOdds =
                winnerPool > 0
                        ? Math.round(((double) totalPool / winnerPool) * 100.0) / 100.0
                        : null;

        double feeRate = Optional.ofNullable(vote.getFeeRate()).orElse(0.0);

        int distributedPoints =
                totalPool > 0
                        ? (int) Math.floor(totalPool * (1 - feeRate))
                        : 0;

        return VoteDetailSettlementSummaryResponse.builder()
                .totalPool(totalPool)
                .winnerPool(winnerPool)
                .winnerCount(winnerCount)
                .loserCount(loserCount)
                .averageOdds(averageOdds)
                .distributedPoints(distributedPoints)
                .build();
    }

    /* =======================================================
     * Article
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
     * Comments
     * ======================================================= */
    private List<VoteDetailCommentResponse> loadComments(Integer voteId) {

        List<VoteCommentEntity> roots =
                voteCommentRepository.findByVote_IdAndParentIsNull(voteId);

        return roots.stream()
                .map(this::convertCommentTree)
                .toList();
    }

    @Transactional
    public VoteDetailCommentResponse updateComment(
            Long commentId,
            Integer userId,
            String newContent
    ) {

        VoteCommentEntity comment = voteCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));

        if (!comment.getUser().getId().equals(userId)) {
            throw new RuntimeException("본인 댓글만 수정할 수 있습니다.");
        }

        comment.setContent(newContent);
        comment.setUpdatedAt(LocalDateTime.now());

        voteCommentRepository.save(comment);

        return convertCommentTree(comment);
    }

    private VoteDetailCommentResponse convertCommentTree(VoteCommentEntity c) {

        List<VoteDetailCommentResponse> children =
                c.getChildren() == null
                        ? List.of()
                        : c.getChildren().stream()
                        .map(this::convertCommentTree)
                        .toList();

        return VoteDetailCommentResponse.builder()
                .commentId(c.getCommentId().intValue())
                .voteId(c.getVote().getId())
                .userId(c.getUser().getId())
                .username(c.getUser().getNickname())
                .userPosition(c.getUserPosition())
                .position(c.getPosition())
                .content(c.getContent())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .parentId(
                        c.getParent() != null
                                ? c.getParent().getCommentId().intValue()
                                : null
                )
                .children(children)
                .likeCount(Optional.ofNullable(c.getLikeCount()).orElse(0))
                .dislikeCount(Optional.ofNullable(c.getDislikeCount()).orElse(0))
                .myLike(false)
                .myDislike(false)
                .linkedChoiceId(
                        c.getChoice() != null
                                ? c.getChoice().getId().intValue()
                                : null
                )
                .build();
    }

    /* =======================================================
     * My Participation Only
     * ======================================================= */
    public MyParticipationResponse getMyParticipationOnly(
            Integer voteId,
            Integer userId
    ) {
        return voteUserRepository.findByUserIdAndVoteId(userId, voteId)
                .map(v -> {

                    long pointsBet = v.getPointsBet() == null ? 0L : v.getPointsBet();
                    double oddsAtBet = v.getOddsAtBet() == null ? 0.0 : v.getOddsAtBet();

                    return MyParticipationResponse.builder()
                            .hasParticipated(true)
                            .isCancelled(Boolean.TRUE.equals(v.getIsCancelled()))
                            .optionId(v.getOption().getId().intValue())
                            .choiceId(
                                    v.getChoice() != null
                                            ? v.getChoice().getId().intValue()
                                            : null
                            )
                            .pointsBet(pointsBet)
                            .oddsAtParticipation(oddsAtBet)
                            .expectedReward(
                                    (int) Math.floor(pointsBet * oddsAtBet)
                            )
                            .votedAt(v.getCreatedAt())
                            .canceledAt(
                                    Boolean.TRUE.equals(v.getIsCancelled())
                                            ? v.getUpdatedAt()
                                            : null
                            )
                            .build();
                })
                .orElse(
                        MyParticipationResponse.builder()
                                .hasParticipated(false)
                                .isCancelled(false)
                                .build()
                );
    }

    @Transactional(readOnly = true)
public VoteTrendChartResponse loadTrendChart(Integer voteId) {

    List<VoteTrendHistoryEntity> histories =
        trendRepository.findByVote_IdOrderByRecordedAtAsc(voteId);

    // optionId 기준 → recordedAt 기준 그룹화
    Map<Integer, Map<LocalDateTime, List<VoteTrendHistoryEntity>>> grouped =
    histories.stream().collect(Collectors.groupingBy(
        (VoteTrendHistoryEntity h) -> h.getChoice().getOption().getId(), // ✅ 타입 고정
        LinkedHashMap::new,
        Collectors.groupingBy(
            VoteTrendHistoryEntity::getRecordedAt,
            LinkedHashMap::new,
            Collectors.toList()
        )
    ));

    List<VoteTrendChartResponse.OptionTrendChart> optionCharts =
        new ArrayList<>();

    for (var optionEntry : grouped.entrySet()) {

        Integer optionId = optionEntry.getKey();
        Map<LocalDateTime, List<VoteTrendHistoryEntity>> timeMap =
            optionEntry.getValue();

        List<Map<String, Object>> chart = new ArrayList<>();
        int step = 1;

        for (var timeEntry : timeMap.entrySet()) {
            Map<String, Object> point = new LinkedHashMap<>();
            point.put("step", step++);

            for (VoteTrendHistoryEntity h : timeEntry.getValue()) {
                point.put(
                    h.getChoice().getChoiceText(), // YES / NO / DRAW
                    h.getOdds()
                );
            }

            chart.add(point);
        }

        String optionTitle =
            timeMap.values().stream()
                .flatMap(List::stream)
                .findFirst()
                .map(h -> h.getChoice().getOption().getOptionTitle())
                .orElse(null);

        optionCharts.add(
            VoteTrendChartResponse.OptionTrendChart.builder()
                .optionId(optionId.intValue())
                .optionTitle(optionTitle)
                .chart(chart)
                .build()
        );
    }

    return VoteTrendChartResponse.builder()
        .voteId(voteId)
        .options(optionCharts)
        .build();
}



    @Transactional
public void recordSnapshot(VoteEntity vote) {

    LocalDateTime now = LocalDateTime.now();

    for (VoteOptionEntity option : vote.getOptions()) {

        int optionTotal =
            Optional.ofNullable(option.getParticipantsCount()).orElse(0);

        for (VoteOptionChoiceEntity choice : option.getChoices()) {

            int choiceCount =
                Optional.ofNullable(choice.getParticipantsCount()).orElse(0);

            double percent =
                optionTotal == 0
                    ? 0
                    : (choiceCount * 100.0 / optionTotal);

            double odds =
                oddsService.calculateChoiceOdds(vote, option, choice);

            VoteTrendHistoryEntity history =
                VoteTrendHistoryEntity.builder()
                    .vote(vote)
                    .option(option)          // 🔥 핵심
                    .choice(choice)
                    .percent(percent)
                    .odds(odds)
                    .totalPoints(
                        Optional.ofNullable(choice.getPointsTotal()).orElse(0)
                    )
                    .recordedAt(now)
                    .build();

            trendRepository.save(history);
        }
    }
}

}
