package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.*;
import org.usyj.makgora.exception.VoteException;
import org.usyj.makgora.repository.*;
import org.usyj.makgora.request.vote.*;
import org.usyj.makgora.response.vote.*;
import org.usyj.makgora.response.voteDetails.VoteDetailMainResponse;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class VoteService {

    @Autowired
    private RankingRepository rankingRepo;
    private final VoteRepository voteRepository;
    private final IssueRepository issueRepository;
    private final VoteOptionRepository optionRepository;
    private final VoteOptionChoiceRepository choiceRepository;
    private final VoteUserRepository voteUserRepository;
    private final UserRepository userRepository;
    private final VoteRuleRepository voteRuleRepository;
    private final VotesStatusHistoryRepository historyRepository;
    private final VoteDetailService voteDetailService;
    private final VoteTrendHistoryRepository trendRepository;

    /* ===============================
       🔹 공용: 상태 히스토리 기록
       =============================== */
    private void logHistory(VoteEntity vote, VoteStatusHistoryEntity.Status status) {
        VoteStatusHistoryEntity history = VoteStatusHistoryEntity.builder()
                .vote(vote)
                .status(status)
                .statusDate(LocalDateTime.now())
                .build();
        historyRepository.save(history);
    }

    /* ===============================
       🔹 1. 모든 투표 조회 (리스트)
       =============================== */
//     public List<VoteDetailResponse> getAllVotes() {
//     return voteRepository.findAll().stream()
//             .map(v -> getVoteDetail(v.getId()))
//             .toList();
// }

/** 선택지의 실시간 배당률 계산 */
private Double calculateOdds(VoteOptionChoiceEntity choice, VoteEntity vote) {
    int totalPool = vote.getOptions().stream()
            .flatMap(opt -> opt.getChoices().stream())
            .mapToInt(VoteOptionChoiceEntity::getPointsTotal)
            .sum();

    if (totalPool == 0 || choice.getPointsTotal() == 0) {
        return null; // 베팅이 없으면 null
    }

    return (double) totalPool / (double) choice.getPointsTotal();
}

@Transactional
private void recordTrend(VoteEntity vote) {

    // 전체 포인트 합
    int totalPool = vote.getOptions().stream()
            .flatMap(opt -> opt.getChoices().stream())
            .mapToInt(c -> c.getPointsTotal() == null ? 0 : c.getPointsTotal())
            .sum();

    LocalDateTime now = LocalDateTime.now();

    vote.getOptions().forEach(opt -> 
        opt.getChoices().forEach(choice -> {

            int myPoints = choice.getPointsTotal() == null ? 0 : choice.getPointsTotal();
            int participants = choice.getParticipantsCount() == null ? 0 : choice.getParticipantsCount();

            double percent = 0.0;
            if (totalPool > 0 && myPoints > 0) {
                percent = Math.round((myPoints * 1000.0 / totalPool)) / 10.0;
            }

            double odds = choice.getOdds() == null ? 1.0 : choice.getOdds();

            VoteTrendHistoryEntity h = VoteTrendHistoryEntity.builder()
                    .vote(vote)
                    .choice(choice)
                    .percent(percent)
                    .odds(odds)
                    .totalPoints(totalPool)
                    .recordedAt(now)
                    .build();

            trendRepository.save(h);
        })
    );
}


    /* ===============================
       🔹 3. 배당률 계산
       =============================== */
    @Transactional(readOnly = true)
    public OddsResponse getOdds(Integer voteId) {

        VoteEntity vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("vote 없음"));

        // 전체 포인트 풀
        int totalPool = vote.getOptions().stream()
                .flatMap(opt -> opt.getChoices().stream())
                .mapToInt(VoteOptionChoiceEntity::getPointsTotal)
                .sum();

        List<OddsResponse.ChoiceOdds> list =
                vote.getOptions().stream()
                        .flatMap(opt -> opt.getChoices().stream())
                        .map(ch -> {
                            Double odds = null;
                            if (ch.getPointsTotal() > 0 && totalPool > 0) {
                                odds = (double) totalPool / (double) ch.getPointsTotal();
                            }

                            return OddsResponse.ChoiceOdds.builder()
                                    .choiceId(ch.getId())
                                    .choiceText(ch.getChoiceText())
                                    .pointsTotal(ch.getPointsTotal())
                                    .participantsCount(ch.getParticipantsCount())
                                    .odds(odds)
                                    .build();
                        })
                        .toList();

        return OddsResponse.builder()
                .voteId(vote.getId())
                .totalPool(totalPool)
                .choices(list)
                .build();
    }


    /* ===============================
   🔹 4. 투표 참여 (최종본)
   =============================== */
@Transactional
public VoteDetailMainResponse participateVote(Integer voteId, VoteParticipateRequest req, Integer userId) {

    VoteOptionChoiceEntity choice = choiceRepository.findById(req.getChoiceId())
            .orElseThrow(() -> new VoteException("CHOICE_NOT_FOUND", "선택지를 찾을 수 없습니다."));

    VoteEntity vote = choice.getOption().getVote();
    UserEntity user = userRepository.findById(userId)
            .orElseThrow(() -> new VoteException("USER_NOT_FOUND", "유저 정보를 찾을 수 없습니다."));

    log.info("🔥 PARTICIPATE userId={} choiceId={} voteId={} points={}",
            user.getId(), voteId, choice.getId(), req.getPoints());

    // 포인트 부족
    if (user.getPoints() < req.getPoints()) {
        throw new VoteException("NOT_ENOUGH_POINTS", "포인트가 부족합니다.");
    }

    // 이미 참여했는지
    if (voteUserRepository.existsByUserIdAndVoteId(userId, voteId)) {
        throw new VoteException("ALREADY_VOTED", "이미 이 투표에 참여했습니다.");
    }

    // 투표 매핑 오류
    if (vote.getId() != voteId.longValue()) {
        throw new VoteException("INVALID_CHOICE_FOR_VOTE", "이 투표에 속하지 않는 선택지입니다.");
    }

    // 투표 종료 여부
    if (vote.getStatus() != VoteEntity.Status.ONGOING) {
        throw new VoteException("VOTE_CLOSED", "이미 종료된 투표입니다.");
    }

    // 참여 저장
    VoteUserEntity vu = VoteUserEntity.builder()
            .vote(vote)
            .user(user)
            .option(choice.getOption())
            .choice(choice)
            .pointsBet(req.getPoints())
            .build();
    voteUserRepository.save(vu);

    // 포인트 차감
    user.setPoints(user.getPoints() - req.getPoints());
    userRepository.save(user);

    // 선택지 업데이트
    choice.setPointsTotal(choice.getPointsTotal() + req.getPoints());
    choice.setParticipantsCount(choice.getParticipantsCount() + 1);
    choiceRepository.save(choice);

    // 투표 전체 통계 업데이트
    vote.setTotalPoints(vote.getTotalPoints() + req.getPoints());
    vote.setTotalParticipants(vote.getTotalParticipants() + 1);
    voteRepository.save(vote);

    // 🔥 모든 odds 재계산
    int totalPool = vote.getOptions().stream()
            .flatMap(opt -> opt.getChoices().stream())
            .mapToInt(VoteOptionChoiceEntity::getPointsTotal)
            .sum();

    vote.getOptions().forEach(opt ->
            opt.getChoices().forEach(ch -> {
                double newOdds;
                if (totalPool == 0 || ch.getPointsTotal() == 0) {
                    newOdds = 1.0;
                } else {
                    newOdds = (double) totalPool / ch.getPointsTotal();
                }
                ch.setOdds(newOdds);
                choiceRepository.save(ch);
            })
    );

    // 🔥🔥🔥 여기! history 기록 (전체 choice 기록됨)
    recordTrend(vote);

    return voteDetailService.getVoteDetail(voteId, userId);
}



    public List<VoteListItemResponse> getVoteList() {
        System.out.println("🔥 [BACKEND] getVoteList() 호출됨");
        List<VoteEntity> list = voteRepository.findAll();
        System.out.println("🔥 [BACKEND] voteRepository.findAll() 결과 개수: " + list.size());

    return voteRepository.findAll().stream()
            .map(v -> {

                IssueEntity issue = v.getIssue();
                RssArticleEntity article = issue.getArticle();

                /* ============================
                   1) category
                   ============================ */
                String category;

                if (article != null) {
                    // RSS 기사 기반 카테고리
                    category = article.getFeed() != null
                            ? article.getFeed().getSourceName()
                            : "뉴스";

                } else if (issue.getCommunityPost() != null) {
                    category = "커뮤니티";

                } else {
                    category = "기타";
                }

                /* ============================
                   2) description
                   ============================ */
                String description = issue.getAiSummary();

                /* ============================
                   3) Thumbnail + URL (RSS 기반)
                   ============================ */
                String thumbnail = (article != null) ? article.getThumbnailUrl() : null;
                String url = (article != null) ? article.getLink() : null;


                /* ============================
                   4) 🔥 옵션 + 선택지 매핑
                   ============================ */
                List<VoteListItemResponse.OptionItem> optionResponses =
        v.getOptions().stream()
                .map(opt -> VoteListItemResponse.OptionItem.builder()
                        .optionId(opt.getId())
                        .title(opt.getOptionTitle())
                        .choices(
                                opt.getChoices().stream()
                                        .map(choice -> VoteListItemResponse.ChoiceItem.builder()
                                                .choiceId(choice.getId())
                                                .text(choice.getChoiceText())
                                                .build()
                                        ).toList()
                        )
                        .build()
                ).toList();


                /* ============================
                   5) 최종 Response
                   ============================ */
                return VoteListItemResponse.builder()
                        .id(v.getId())
                        .title(v.getTitle())
                        .category(category)
                        .description(description)
                        .thumbnail(thumbnail)
                        .url(url)
                        .endAt(v.getEndAt())
                        .status(v.getStatus().name())
                        .totalPoints(v.getTotalPoints())
                        .totalParticipants(v.getTotalParticipants())
                        
                        // 🔥 옵션 리스트 반드시 포함
                        .options(optionResponses)

                        .build();

            }).toList();
}


@Transactional
public VoteDetailMainResponse cancelMyVote(Long voteUserId, Integer userId) {

    VoteUserEntity voteUser = voteUserRepository.findById(voteUserId)
            .orElseThrow(() -> new RuntimeException("베팅 정보를 찾을 수 없습니다."));

    if (!voteUser.getUser().getId().equals(userId)) {
        throw new RuntimeException("내 베팅만 취소할 수 있습니다.");
    }

    VoteEntity vote = voteUser.getVote();

    if (vote.getStatus() != VoteEntity.Status.ONGOING) {
        throw new RuntimeException("진행 중인 투표만 취소할 수 있습니다.");
    }

    if (Boolean.TRUE.equals(voteUser.getIsCancelled())) {
        throw new RuntimeException("이미 취소된 베팅입니다.");
    }

    // 선택지 통계 되돌리기
    VoteOptionChoiceEntity choice = voteUser.getChoice();
    choice.setPointsTotal(choice.getPointsTotal() - voteUser.getPointsBet());
    choice.setParticipantsCount(choice.getParticipantsCount() - 1);
    choiceRepository.save(choice);

    // vote 전체 집계 되돌리기
    vote.setTotalPoints(vote.getTotalPoints() - voteUser.getPointsBet());
    vote.setTotalParticipants(vote.getTotalParticipants() - 1);
    voteRepository.save(vote);

    // 유저 포인트 반환
    UserEntity user = voteUser.getUser();
    user.setPoints(user.getPoints() + voteUser.getPointsBet());
    userRepository.save(user);

    // 취소 처리
    voteUser.setIsCancelled(true);
    voteUser.setUpdatedAt(LocalDateTime.now());
    voteUserRepository.save(voteUser);

    // 🔥 여기 수정됨
    return voteDetailService.getVoteDetail(voteUser.getVote().getId(), userId);
}

@Transactional
public VoteDetailMainResponse cancelVote(Integer voteId, Integer userId) {

    VoteEntity vote = voteRepository.findById(voteId)
            .orElseThrow(() -> new RuntimeException("투표 없음"));

    if (vote.getStatus() != VoteEntity.Status.ONGOING) {
        throw new RuntimeException("진행 중인 투표만 취소할 수 있습니다.");
    }

    VoteUserEntity vu = voteUserRepository.findByUserIdAndVoteId(userId, voteId)
            .orElseThrow(() -> new RuntimeException("해당 투표에서 베팅한 내역이 없습니다."));

    if (Boolean.TRUE.equals(vu.getIsCancelled())) {
        throw new RuntimeException("이미 취소된 베팅입니다.");
    }

    // 선택지 통계 되돌리기
    VoteOptionChoiceEntity choice = vu.getChoice();
    choice.setPointsTotal(choice.getPointsTotal() - vu.getPointsBet());
    choice.setParticipantsCount(choice.getParticipantsCount() - 1);
    choiceRepository.save(choice);

    // vote 통계 되돌리기
    vote.setTotalPoints(vote.getTotalPoints() - vu.getPointsBet());
    vote.setTotalParticipants(vote.getTotalParticipants() - 1);
    voteRepository.save(vote);

    // 유저 포인트 반환
    UserEntity user = vu.getUser();
    user.setPoints(user.getPoints() + vu.getPointsBet());
    userRepository.save(user);

    // 취소 처리
    vu.setIsCancelled(true);
    vu.setUpdatedAt(LocalDateTime.now());
    voteUserRepository.save(vu);

    // 🔥 여기 핵심 수정
    return voteDetailService.getVoteDetail(vote.getId(), userId);
}


@Transactional(readOnly = true)
public VoteStatisticsResponse getMyStatistics(Integer userId) {

    List<VoteUserEntity> votes = voteUserRepository.findByUserId(userId);

    int wins = 0;
    int losses = 0;
    int pending = 0;

    int currentStreak = 0;
    int maxStreak = 0;

    // 정렬: 최근 종료된 투표 순 → 연승 계산에 필요
    List<VoteUserEntity> sorted = votes.stream()
            .filter(vu -> vu.getVote().getStatus() == VoteEntity.Status.REWARDED
                    || vu.getVote().getStatus() == VoteEntity.Status.RESOLVED)
            .sorted((a, b) -> b.getVote().getEndAt().compareTo(a.getVote().getEndAt()))
            .toList();

    // 기본 승/패/보류 계산
    for (VoteUserEntity vu : votes) {

        VoteEntity vote = vu.getVote();

        if (Boolean.TRUE.equals(vu.getIsCancelled())) {
            pending++;
            continue;
        }

        if (vote.getCorrectChoice() == null) {
            pending++;
            continue;
        }

        boolean win = vu.getChoice().getId().equals(vote.getCorrectChoice().getId());

        if (win) wins++;
        else losses++;
    }

    // 연승 계산
    for (VoteUserEntity vu : sorted) {

        VoteEntity vote = vu.getVote();

        if (vote.getCorrectChoice() == null) break;

        boolean win = vu.getChoice().getId().equals(vote.getCorrectChoice().getId());

        if (win) {
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
        } else {
            break;
        }
    }

    int total = wins + losses + pending;

    return VoteStatisticsResponse.builder()
            .totalBets(total)
            .wins(wins)
            .losses(losses)
            .pending(pending)
            .winRate(total > 0 ? (double) wins / (wins + losses) : 0.0)
            .currentWinStreak(currentStreak)
            .maxWinStreak(maxStreak)
            .build();
}





    /* ===============================
       🔹 5. 내 투표 조회
       =============================== */
    @Transactional(readOnly = true)
public List<MyVoteListResponse> getMyVotes(Integer userId) {

    List<VoteUserEntity> myVotes = voteUserRepository.findByUserId(userId);

    return myVotes.stream().map(vu -> {

        VoteEntity vote = vu.getVote();
        VoteOptionChoiceEntity choice = vu.getChoice();

        String issueTitle = vote.getIssue().getTitle();

        String resultStatus;
        Integer rewardAmount = null;

        boolean isCancelled = Boolean.TRUE.equals(vu.getIsCancelled());

        // 🔹 취소된 경우
        if (isCancelled) {
            resultStatus = "CANCELLED";
            rewardAmount = 0;
        }

        // 🔹 정산 완료
        else if (vote.getStatus() == VoteEntity.Status.REWARDED) {

            boolean win = vote.getCorrectChoice() != null &&
                    vote.getCorrectChoice().getId().equals(choice.getId());

            // 전체 베팅 금액 조회
            List<VoteUserEntity> allBets =
                    voteUserRepository.findByVoteId(vote.getId())
                            .stream()
                            .filter(x -> !Boolean.TRUE.equals(x.getIsCancelled()))
                            .toList();

            int totalPool = allBets.stream()
                    .mapToInt(VoteUserEntity::getPointsBet)
                    .sum();

            int correctPool = allBets.stream()
                    .filter(x -> x.getChoice().getId().equals(vote.getCorrectChoice().getId()))
                    .mapToInt(VoteUserEntity::getPointsBet)
                    .sum();

            double odds = (double) totalPool / (double) correctPool;
            double feeRate = vote.getFeeRate();

            if (win) {
                resultStatus = "WIN";

                int originalReward = (int) Math.floor(vu.getPointsBet() * odds);
                int rewardAfterFee = (int) Math.floor(originalReward * (1 - feeRate));

                rewardAmount = rewardAfterFee - vu.getPointsBet();
            } else {
                resultStatus = "LOSE";
                rewardAmount = -vu.getPointsBet();
            }
        }

        // 🔹 정답은 확정되었지만 정산 전
        else if (vote.getStatus() == VoteEntity.Status.RESOLVED) {

            boolean win = vote.getCorrectChoice() != null &&
                    vote.getCorrectChoice().getId().equals(choice.getId());

            resultStatus = win ? "WIN" : "LOSE";
            rewardAmount = null;
        }

        // 🔹 아직 진행중
        else {
            resultStatus = "PENDING";
            rewardAmount = null;
        }

        return MyVoteListResponse.builder()
                .voteUserId(vu.getId())
                .voteId(vote.getId())
                .voteTitle(vote.getTitle())
                .issueTitle(issueTitle)
                .choiceId(choice.getId())
                .choiceText(choice.getChoiceText())
                .pointsBet(vu.getPointsBet())
                .rewardAmount(rewardAmount)
                .result(resultStatus)
                .voteCreatedAt(vote.getCreatedAt())
                .voteEndAt(vote.getEndAt())
                .voteStatus(vote.getStatus().name())
                .build();

    }).toList();
}



    /* ===============================
       🔹 6. AI 기반 자동 생성
       =============================== */
    @Transactional
public VoteResponse createVoteByAI(VoteAiCreateRequest req) {

    IssueEntity issue = issueRepository.findById(req.getIssueId())
            .orElseThrow(() -> new RuntimeException("Issue not found"));

    // 기본 상태값
    VoteEntity.Status status = VoteEntity.Status.REVIEWING;
    if (req.getInitialStatus() != null) {
        try {
            status = VoteEntity.Status.valueOf(req.getInitialStatus());
        } catch (Exception ignore) {}
    }

    // ===== 1) VoteEntity 생성 =====
    VoteEntity vote = VoteEntity.builder()
            .issue(issue)
            .title(req.getQuestion())       // 🔥 AI question 그대로 사용
            .status(status)
            .feeRate(req.getFeeRate() != null ? req.getFeeRate() : 0.10)
            .endAt(req.getEndAt())          // 🔥 AI endAt 그대로 사용
            .build();

    voteRepository.save(vote);

    // ===== 2) 옵션 + 선택지 저장 =====
    List<VoteResponse.OptionResponse> optionResponses = new ArrayList<>();

    for (VoteAiCreateRequest.OptionDto opt : req.getOptions()) {

        // 옵션 저장
        VoteOptionEntity option = VoteOptionEntity.builder()
                .vote(vote)
                .optionTitle(opt.getTitle())       // 🔥 AI title 그대로
                .build();
        optionRepository.save(option);

        List<VoteResponse.ChoiceResponse> choiceResponses = new ArrayList<>();

        // 선택지 저장 (YES / NO / DRAW 등 AI가 준 순서 그대로)
        for (String choiceText : opt.getChoices()) {

            VoteOptionChoiceEntity choice = VoteOptionChoiceEntity.builder()
                    .option(option)
                    .choiceText(choiceText)        // 🔥 AI choice 그대로
                    .participantsCount(0)
                    .pointsTotal(0)
                    .build();

            choiceRepository.save(choice);

            choiceResponses.add(VoteResponse.ChoiceResponse.fromEntity(choice));
        }

        optionResponses.add(
                VoteResponse.OptionResponse.builder()
                        .optionId(option.getId())
                        .optionTitle(option.getOptionTitle())
                        .choices(choiceResponses)
                        .build()
        );
    }

    // ===== 3) 룰 저장 =====
    if (req.getRule() != null) {
        VoteRuleEntity rule = VoteRuleEntity.builder()
                .vote(vote)
                .ruleType(req.getRule().getType())        // 🔥 그대로
                .ruleDescription(req.getRule().getDescription())
                .build();
        voteRuleRepository.save(rule);
    }

    // ===== 4) 상태 히스토리 저장 =====
    VoteStatusHistoryEntity history = VoteStatusHistoryEntity.builder()
            .vote(vote)
            .status(VoteStatusHistoryEntity.Status.REVIEWING)
            .statusDate(LocalDateTime.now())
            .build();
    historyRepository.save(history);

    // ===== 5) Response 반환 =====
    return VoteResponse.builder()
            .voteId(vote.getId())
            .title(vote.getTitle())
            .status(vote.getStatus().name())
            .endAt(vote.getEndAt())
            .rewarded(vote.getRewarded())
            .options(optionResponses)
            .build();
}

@Transactional
public String finishVote(Integer voteId) {

    VoteEntity vote = voteRepository.findById(voteId)
            .orElseThrow(() -> new RuntimeException("투표 없음"));

    if (vote.getStatus() != VoteEntity.Status.ONGOING) {
        throw new RuntimeException("진행 중인 투표만 마감할 수 있습니다.");
    }

    vote.setStatus(VoteEntity.Status.FINISHED);
    voteRepository.save(vote);

    logHistory(vote, VoteStatusHistoryEntity.Status.FINISHED);

    return "투표가 마감되었습니다.";
}

@Transactional
public String resolveVote(Integer voteId, Long choiceId) {

    VoteEntity vote = voteRepository.findById(voteId)
            .orElseThrow(() -> new RuntimeException("투표 없음"));

    if (vote.getStatus() != VoteEntity.Status.FINISHED) {
        throw new RuntimeException("마감된 투표만 정답을 확정할 수 있습니다.");
    }

    VoteOptionChoiceEntity correct = choiceRepository.findById(choiceId)
            .orElseThrow(() -> new RuntimeException("choice 없음"));

    vote.setCorrectChoice(correct);
    vote.setStatus(VoteEntity.Status.RESOLVED);
    voteRepository.save(vote);
    updateVoteResults(vote);

    logHistory(vote, VoteStatusHistoryEntity.Status.RESOLVED);

    return "정답이 확정되었습니다.";
}

private void updateVoteResults(VoteEntity vote) {

    List<VoteUserEntity> bets = voteUserRepository.findByVoteId(vote.getId());

    for (VoteUserEntity vu : bets) {

        if (Boolean.TRUE.equals(vu.getIsCancelled())) continue;

        Integer userId = vu.getUser().getId();

        // 🔥 이 유저의 승률/연승 랭킹을 다시 계산해서 score 갱신
        updateWinRate(userId);
        updateStreak(userId);
    }
}

/** 🔥 승률 업데이트 */
@Transactional
public void updateWinRate(Integer userId) {

    // 1) 사용자의 전체 투표내역 조회
    List<VoteUserEntity> records = voteUserRepository.findByUserId(userId).stream()
            .filter(vu -> !Boolean.TRUE.equals(vu.getIsCancelled()))
            .filter(vu -> vu.getVote() != null)
            .filter(vu -> vu.getVote().getCorrectChoice() != null)
            .toList();

    int wins = 0;
    int losses = 0;

    for (VoteUserEntity vu : records) {
        boolean win = vu.getChoice().getId().equals(vu.getVote().getCorrectChoice().getId());
        if (win) wins++; else losses++;
    }

    int total = wins + losses;
    int winRate = total > 0 ? (wins * 100 / total) : 0;

    // 2) Ranking 엔티티에 저장
    RankingEntity ranking = rankingRepo
            .findByUser_IdAndRankingType(userId, RankingEntity.RankingType.WINRATE)
            .orElse(RankingEntity.builder()
                    .user(userRepository.findById(userId).orElseThrow())
                    .rankingType(RankingEntity.RankingType.WINRATE)
                    .ranking(0)
                    .score(0)
                    .build()
            );

    ranking.setScore(winRate);
    rankingRepo.save(ranking);
}

/** 🔥 연승 업데이트 */
@Transactional
public void updateStreak(Integer userId) {

    // 최근 종료된 투표 내역만
    List<VoteUserEntity> records = voteUserRepository.findByUserId(userId).stream()
        .filter(vu -> !Boolean.TRUE.equals(vu.getIsCancelled()))
        .filter(vu -> vu.getVote() != null)
        .filter(vu -> vu.getVote().getStatus() == VoteEntity.Status.REWARDED
                   || vu.getVote().getStatus() == VoteEntity.Status.RESOLVED)
        .sorted((a, b) -> b.getVote().getEndAt().compareTo(a.getVote().getEndAt()))
        .toList();

    int current = 0;
    int max = 0;

    for (VoteUserEntity vu : records) {

        VoteEntity vote = vu.getVote();
        if (vote.getCorrectChoice() == null) break;

        boolean win = vu.getChoice().getId().equals(vote.getCorrectChoice().getId());
        if (win) {
            current++;
            max = Math.max(max, current);
        } else {
            break;
        }
    }

    RankingEntity ranking = rankingRepo
            .findByUser_IdAndRankingType(userId, RankingEntity.RankingType.STREAK)
            .orElse(RankingEntity.builder()
                    .user(userRepository.findById(userId).orElseThrow())
                    .rankingType(RankingEntity.RankingType.STREAK)
                    .ranking(0)
                    .score(0)
                    .build()
            );

    ranking.setScore(current);   // 현재 연승만 저장
    ranking.setRanking(max);     // 최고 연승 기록 저장(선택사항)

    rankingRepo.save(ranking);
}


@Transactional
public String rewardVote(Integer voteId) {

    VoteEntity vote = voteRepository.findById(voteId)
            .orElseThrow(() -> new RuntimeException("투표 없음"));

    if (vote.getStatus() != VoteEntity.Status.RESOLVED) {
        throw new RuntimeException("정답이 확정된 투표만 보상할 수 있습니다.");
    }

    VoteOptionChoiceEntity correct = vote.getCorrectChoice();

    List<VoteUserEntity> bets = voteUserRepository.findByVoteId(voteId)
            .stream()
            .filter(vu -> !Boolean.TRUE.equals(vu.getIsCancelled()))
            .toList();

    if (bets.isEmpty()) {
        vote.setRewarded(true);
        vote.setStatus(VoteEntity.Status.REWARDED);
        voteRepository.save(vote);
        return "참여자가 없어 정산 없이 종료되었습니다.";
    }

    int totalPool = bets.stream().mapToInt(VoteUserEntity::getPointsBet).sum();

    List<VoteUserEntity> winners = bets.stream()
            .filter(vu -> vu.getChoice().getId().equals(correct.getId()))
            .toList();

    int correctPool = winners.stream()
            .mapToInt(VoteUserEntity::getPointsBet)
            .sum();

    if (correctPool == 0) {
        vote.setRewarded(true);
        vote.setStatus(VoteEntity.Status.REWARDED);
        voteRepository.save(vote);
        return "정답 선택자가 없어 정산 없이 종료되었습니다.";
    }

    double odds = (double) totalPool / (double) correctPool;
    double feeRate = vote.getFeeRate();

    // 정답 선택지에 odds 저장
    correct.setOdds(odds);
    choiceRepository.save(correct);

    for (VoteUserEntity vu : winners) {
        UserEntity user = vu.getUser();

        int originalReward = (int) Math.floor(vu.getPointsBet() * odds);
        int rewardAfterFee = (int) Math.floor(originalReward * (1 - feeRate));

        user.setPoints(user.getPoints() + rewardAfterFee);
        userRepository.save(user);
    }

    vote.setRewarded(true);
    vote.setStatus(VoteEntity.Status.REWARDED);
    voteRepository.save(vote);

    logHistory(vote, VoteStatusHistoryEntity.Status.REWARDED);

    return "보상 지급 완료";
}

@Transactional
public VoteResponse createVoteByUser(UserVoteCreateRequest req, Integer userId) {

    IssueEntity issue = issueRepository.findById(req.getIssueId())
            .orElseThrow(() -> new RuntimeException("Issue not found"));

    // ===== 1) VoteEntity 생성 =====
    VoteEntity vote = VoteEntity.builder()
            .issue(issue)
            .title(req.getTitle())
            .status(VoteEntity.Status.ONGOING)   // 🔥 유저 생성은 기본 진행중
            .feeRate(0.10)
            .endAt(req.getEndAt())
            .build();

    voteRepository.save(vote);

    // ===== 2) 옵션 + 선택지 저장 =====
    List<VoteResponse.OptionResponse> optionResponses = new ArrayList<>();

    for (UserVoteCreateRequest.OptionDto opt : req.getOptions()) {

        VoteOptionEntity option = VoteOptionEntity.builder()
                .vote(vote)
                .optionTitle(opt.getTitle())
                .build();

        optionRepository.save(option);

        List<VoteResponse.ChoiceResponse> choiceResponses = new ArrayList<>();

        for (String ch : opt.getChoices()) {

            VoteOptionChoiceEntity choice = VoteOptionChoiceEntity.builder()
                    .option(option)
                    .choiceText(ch)
                    .participantsCount(0)
                    .pointsTotal(0)
                    .build();

            choiceRepository.save(choice);

            choiceResponses.add(VoteResponse.ChoiceResponse.fromEntity(choice));
        }

        optionResponses.add(
                VoteResponse.OptionResponse.builder()
                        .optionId(option.getId())
                        .optionTitle(option.getOptionTitle())
                        .choices(choiceResponses)
                        .build()
        );
    }

    // ===== 3) 룰 저장 (선택)
    if (req.getRule() != null) {
        VoteRuleEntity rule = VoteRuleEntity.builder()
                .vote(vote)
                .ruleType(req.getRule().getType())
                .ruleDescription(req.getRule().getDescription())
                .build();

        voteRuleRepository.save(rule);
    }

    // ===== 4) 상태 히스토리 저장 =====
    logHistory(vote, VoteStatusHistoryEntity.Status.ONGOING);

    // ===== 5) 결과 반환 =====
    return VoteResponse.builder()
            .voteId(vote.getId())
            .title(vote.getTitle())
            .status(vote.getStatus().name())
            .endAt(vote.getEndAt())
            .rewarded(vote.getRewarded())
            .options(optionResponses)
            .build();
}


}
