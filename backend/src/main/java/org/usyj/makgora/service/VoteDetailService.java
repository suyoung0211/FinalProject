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
     * Main Entry: Vote Detail Response Root
     * ======================================================= */
    public VoteDetailMainResponse getVoteDetail(Integer voteId, Integer userId) {

        VoteEntity vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("Vote not found"));

        // 1) 서브 DTO 로딩
        VoteDetailArticleResponse article = loadArticle(vote);
        List<VoteDetailOptionResponse> options = loadOptions(voteId, userId);
        VoteDetailOddsResponse odds = loadOdds(voteId);
        VoteDetailStatisticsResponse statistics = loadStatistics(voteId);
        VoteDetailParticipationResponse myParticipation = loadMyParticipation(voteId, userId);
        List<VoteDetailCommentResponse> comments = loadComments(voteId);

        // 2) 전체 총합 계산 (옵션들의 총합 기준)
        long totalPoints = options.stream()
                .mapToLong(o -> o.getTotalPoints() != null ? o.getTotalPoints() : 0L)
                .sum();

        int totalParticipants = options.stream()
                .mapToInt(o -> o.getTotalParticipants() != null ? o.getTotalParticipants() : 0)
                .sum();

        // 3) 정답/상태 관련 필드
        Integer correctChoiceId = (vote.getCorrectChoice() != null)
                ? vote.getCorrectChoice().getId().intValue()
                : null;

        boolean isResolved = (vote.getStatus() == VoteEntity.Status.RESOLVED
                || vote.getStatus() == VoteEntity.Status.REWARDED);

        boolean isRewarded = Boolean.TRUE.equals(vote.getRewarded());

        // 4) (선택) 정산 요약 summary – 아직은 간단한 형태로
        VoteDetailSettlementSummaryResponse settlementSummary = null;
        if (isResolved && vote.getCorrectChoice() != null) {
            // 전체 풀
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
                    .distributedPoints(null)     // 실제 분배 값은 VoteSettlementService에서 주입 가능
                    .averageOdds(null)           // 필요시 추후 계산
                    .loserCount(null)
                    .build();
        }

        return VoteDetailMainResponse.builder()
                .voteId(voteId)
                .type("AI")   // 현재는 AI Vote만이므로 고정, 필요 시 분기
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

                // 아직 구현 전이니 일단 null / 빈 리스트로 내려주고,
                // 나중에 bettor 요약/활동 로그 추가 시 여기 채우면 됨
                .bettors(Collections.emptyList())
                .settlementSummary(settlementSummary)
                .activityLog(Collections.emptyList())
                .build();
    }

    private VoteDetailCommentResponse convertComment(VoteCommentEntity e) {
    return VoteDetailCommentResponse.builder()
            .commentId(e.getCommentId().intValue())
            .voteId(e.getVote() != null ? e.getVote().getId() : null)
            .normalVoteId(null)
            .userId(e.getUser().getId())
            .username(e.getUser().getNickname())
            .content(e.getContent())
            .position(e.getPosition())
            .likeCount(e.getLikeCount())
            .dislikeCount(e.getDislikeCount())
            .createdAt(e.getCreatedAt())
            .updatedAt(e.getUpdatedAt())
            .parentId(e.getParent() != null ? e.getParent().getCommentId().intValue() : null)
            .children(
                    e.getChildren().stream()
                            .map(this::convertComment)
                            .toList()
            )
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
                .categories(article.getCategories().stream().map(ArticleCategoryEntity::getName).toList())
                .publishedAt(article.getPublishedAt())
                .createdAt(article.getCreatedAt())
                .viewCount(article.getViewCount())
                .likeCount(article.getLikeCount())
                .dislikeCount(article.getDislikeCount())
                .commentCount(article.getCommentCount())
                .build();
    }

    /* =======================================================
     * 2) 옵션 + 선택지 로딩 (+ isMyChoice, marketShare)
     * ======================================================= */
    private List<VoteDetailOptionResponse> loadOptions(Integer voteId, Integer userId) {

    List<VoteOptionEntity> options = voteOptionRepository.findByVoteId(voteId.longValue());

    // 유저의 선택 기록 (있으면) AtomicReference 로 래핑
    AtomicReference<Long> myChoiceRef = new AtomicReference<>(null);
    if (userId != null) {
        voteUserRepository.findByUserIdAndVoteId(userId, voteId)
                .ifPresent(vu -> myChoiceRef.set(vu.getChoice().getId()));
    }

    return options.stream().map(opt -> {

        List<VoteOptionChoiceEntity> choiceEntities = opt.getChoices();

        // 옵션 전체 참여자 수/포인트 (marketShare 계산용)
        int optionTotalParticipants = choiceEntities.stream()
                .mapToInt(c -> c.getParticipantsCount() == null ? 0 : c.getParticipantsCount())
                .sum();

        long optionTotalPoints = choiceEntities.stream()
                .mapToLong(c -> c.getPointsTotal() == null ? 0L : c.getPointsTotal())
                .sum();

        List<VoteDetailChoiceResponse> choices = choiceEntities.stream()
                .map(c -> {

                    int participants = c.getParticipantsCount() == null ? 0 : c.getParticipantsCount();
                    long points = c.getPointsTotal() == null ? 0L : c.getPointsTotal();

                    double marketShare = 0.0;
                    if (optionTotalPoints > 0) {
                        marketShare = Math.round((points * 1000.0 / optionTotalPoints)) / 10.0;  // 소수점 1자리
                    }

                    return VoteDetailChoiceResponse.builder()
                            .choiceId(c.getId().intValue())
                            .text(c.getChoiceText())
                            .participantsCount(participants)
                            .pointsTotal(points)
                            .odds(c.getOdds() != null ? c.getOdds() : 1.0)
                            .percent(calcPercentByParticipants(c, choiceEntities))
                            .marketShare(marketShare)
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

    /* 인원 기준 percent 계산 (선택지 퍼센트) */
    private double calcPercentByParticipants(VoteOptionChoiceEntity choice,
                                             List<VoteOptionChoiceEntity> allChoicesInOption) {

        int total = allChoicesInOption.stream()
                .mapToInt(c -> c.getParticipantsCount() == null ? 0 : c.getParticipantsCount())
                .sum();

        if (total == 0) return 0.0;

        int my = choice.getParticipantsCount() == null ? 0 : choice.getParticipantsCount();

        return Math.round((my * 1000.0 / total)) / 10.0; // 소수점 1자리
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
                        .odds(c.getOdds() != null ? c.getOdds() : 1.0)
                        // 배당 history는 VoteTrendHistory로부터 계산 가능하지만,
                        // 지금은 일단 빈 리스트로 내려두고, 나중에 필요하면 채우자.
                        .history(List.of())
                        .build())
                .toList();

        return VoteDetailOddsResponse.builder()
                .voteId(voteId)
                .odds(oddsItems)
                .build();
    }

    /* =======================================================
     * 4) Trend Graph (통계 변화) - 새 DTO 구조에 맞게 수정
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
                history.stream().collect(Collectors.groupingBy(VoteTrendHistoryEntity::getRecordedAt,
                        LinkedHashMap::new, Collectors.toList()));

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

                    // 예상 배당/보상 계산 (단순 버전)
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
     * 6) 댓글 로딩 (트리 구조, 무한 대댓글)
     * ======================================================= */
    private List<VoteDetailCommentResponse> loadComments(Integer voteId) {

        List<VoteCommentEntity> rootComments =
                voteCommentRepository.findByVoteIdAndParentIsNull(voteId);

        return rootComments.stream()
                .map(this::convertCommentTree)
                .toList();
    }

    private VoteDetailCommentResponse convertCommentTree(VoteCommentEntity c) {

        // children 재귀 변환
        List<VoteDetailCommentResponse> childDtos =
                c.getChildren() == null
                        ? List.of()
                        : c.getChildren().stream()
                        .map(this::convertComment)
                        .toList();

        // 좋아요/싫어요 + choice 연결은 엔티티에 맞게 수정
        Integer likeCount = (c.getLikeCount() != null) ? c.getLikeCount() : 0;
        Integer dislikeCount = (c.getDislikeCount() != null) ? c.getDislikeCount() : 0;

        Integer linkedChoiceId = (c.getChoice() != null)
                ? c.getChoice().getId().intValue()
                : null;

        return VoteDetailCommentResponse.builder()
                .commentId(c.getCommentId().intValue())
                .voteId(c.getVote() != null ? c.getVote().getId() : null)
                .normalVoteId(c.getNormalVote() != null ? c.getNormalVote().getId().intValue() : null)

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
                .myLike(false)       // per-user 상태는 별도 로직/테이블 필요. 일단 false.
                .myDislike(false)
                .linkedChoiceId(linkedChoiceId)
                .build();
    }

    public MyParticipationResponse getMyParticipationOnly(Integer voteId, Integer userId) {
    return voteUserRepository.findByUserIdAndVoteId(userId, voteId)
            .map(v -> MyParticipationResponse.builder()
                    .hasParticipated(true)
                    .isCancelled(Boolean.TRUE.equals(v.getIsCancelled()))
                    .optionId(v.getOption().getId().intValue())
                    .choiceId(v.getChoice().getId().intValue())
                    .pointsBet(v.getPointsBet().longValue())
                    .votedAt(v.getCreatedAt())
                    .canceledAt(v.getIsCancelled() ? v.getUpdatedAt() : null)
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
