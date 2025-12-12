package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

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
@Slf4j
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
        long totalPoints = vote.getTotalPoints() != null ? vote.getTotalPoints() : 0L;
        int totalParticipants = vote.getTotalParticipants() != null ? vote.getTotalParticipants() : 0;

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
        Double rootExpectedOdds = null;
        Integer rootExpectedReward = null;

        // 5-1) 이미 참여한 경우 → 내 배팅 기준 기대값 노출
        if (myParticipation != null && Boolean.TRUE.equals(myParticipation.getHasParticipated())) {
            rootExpectedOdds = myParticipation.getExpectedOdds();
            rootExpectedReward = myParticipation.getExpectedReward();
        } else {
            // 5-2) 아직 참여 안 했으면 → 대표 선택지(첫 번째 choice)의 현재 배당률을 노출
            Optional<VoteDetailChoiceResponse> firstChoiceOpt =
                    options.stream()
                            .flatMap(o -> o.getChoices().stream())
                            .findFirst();

            if (firstChoiceOpt.isPresent()) {
                rootExpectedOdds = firstChoiceOpt.get().getOdds();
                // amount(배팅 포인트)를 모르는 상태이므로 reward는 null 유지
                rootExpectedReward = null;
            }
        }

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
     *  Odds 계산 (AI Vote 전용)
     * ======================================================= */
    private Map<Long, Double> calculateOdds(List<VoteOptionChoiceEntity> choices) {

        // 총 포인트
        long totalPool = choices.stream()
                .mapToLong(c -> c.getPointsTotal() == null ? 0L : c.getPointsTotal())
                .sum();

        // 아무도 배팅 안 했으면 모든 배당 = 1.0
        if (totalPool == 0) {
            return choices.stream()
                    .collect(Collectors.toMap(
                            VoteOptionChoiceEntity::getId,
                            c -> 1.0
                    ));
        }

        Map<Long, Double> oddsMap = new HashMap<>();

        for (VoteOptionChoiceEntity c : choices) {

            long points = (c.getPointsTotal() == null ? 0L : c.getPointsTotal());
            long safePoints = Math.max(points, 1); // division by zero 방지

            double rawOdds = (double) totalPool / safePoints;

            // 상한선 (+ 소수점 보정)
            double finalOdds = Math.min(rawOdds, 10.0);
            finalOdds = Math.round(finalOdds * 100) / 100.0;

            oddsMap.put(c.getId(), finalOdds);
        }

        return oddsMap;
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

        // 모든 choice 모음
        List<VoteOptionChoiceEntity> allChoices =
                options.stream().flatMap(o -> o.getChoices().stream()).toList();

        // 🔥 odds 계산
        Map<Long, Double> oddsMap = calculateOdds(allChoices);

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

            List<VoteDetailChoiceResponse> choices = choiceEntities.stream()
                    .map(c -> {

                        int participants = c.getParticipantsCount() == null ? 0 : c.getParticipantsCount();
                        long points = c.getPointsTotal() == null ? 0L : c.getPointsTotal();

                        double percent = calcPercentByParticipants(c, choiceEntities);

                        // ⭐ 계산된 odds 적용
                        double odds = oddsMap.getOrDefault(c.getId(), 1.0);

                        return VoteDetailChoiceResponse.builder()
                                .choiceId(c.getId().intValue())
                                .text(c.getChoiceText())
                                .participantsCount(participants)
                                .pointsTotal(points)
                                .percent(percent)
                                .marketShare(percent)
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
            .toList();

    Map<Long, Double> oddsMap = calculateOdds(allChoices);

    // 🔥 모든 트렌드 히스토리 로드
    List<VoteTrendHistoryEntity> historyList = trendRepository.findByVoteId(voteId);
    historyList.sort(Comparator.comparing(VoteTrendHistoryEntity::getRecordedAt));

    List<VoteDetailOddsResponse.OddsItem> oddsItems = allChoices.stream()
            .map(choice -> {

                List<VoteDetailOddsResponse.OddsHistoryItem> history =
                        historyList.stream()
                                .filter(h -> h.getChoice().getId().equals(choice.getId()))
                                .map(h -> VoteDetailOddsResponse.OddsHistoryItem.builder()
                                        .odds(h.getOdds())
                                        .percent(h.getPercent())
                                        .totalPoints(h.getTotalPoints())
                                        .timestamp(h.getRecordedAt().toString())
                                        .build()
                                )
                                .toList();

                return VoteDetailOddsResponse.OddsItem.builder()
                        .choiceId(choice.getId().intValue())
                        .text(choice.getChoiceText())
                        .odds(oddsMap.get(choice.getId()))
                        .history(history)
                        .build();
            })
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

        log.info("🔥 loadMyParticipation userId={} voteId={}", userId, voteId);

        if (userId == null) {
                log.warn("❗ userId가 null → 로그인 정보 전달 안됨");
            return VoteDetailParticipationResponse.builder()
                    .hasParticipated(false)
                    .build();
        }

        return voteUserRepository.findByUserIdAndVoteId(userId, voteId)
                .map(v -> {
                    log.info("🔥 참여 기록 발견! choiceId={} points={}", 
                        v.getChoice().getId(), v.getPointsBet());
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
                .orElseGet(() -> {
                    log.warn("❗ 참여 기록 없음 → false 반환");
                    return VoteDetailParticipationResponse.builder()
                            .hasParticipated(false)
                            .build();
                });
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

    @Transactional
    public VoteDetailCommentResponse updateComment(Long commentId, Integer userId, String newContent) {

        VoteCommentEntity comment = voteCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));

        // 본인 댓글인지 확인
        if (!comment.getUser().getId().equals(userId)) {
            throw new RuntimeException("본인 댓글만 수정할 수 있습니다.");
        }

        comment.setContent(newContent);
        comment.setUpdatedAt(LocalDateTime.now());

        voteCommentRepository.save(comment);

        return convertCommentTree(comment); // 기존 트리 변환 DTO 재사용
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
