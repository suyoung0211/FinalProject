package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.*;
import org.usyj.makgora.repository.*;
import org.usyj.makgora.request.vote.*;
import org.usyj.makgora.response.vote.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VoteService {

    private final VoteRepository voteRepository;
    private final IssueRepository issueRepository;
    private final VoteOptionRepository optionRepository;
    private final VoteOptionChoiceRepository choiceRepository;
    private final VoteUserRepository voteUserRepository;
    private final UserRepository userRepository;
    private final VoteRuleRepository voteRuleRepository;
    private final VotesStatusHistoryRepository historyRepository;

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


    /* ===============================
       🔹 2. 투표 상세 조회
       =============================== */
    @Transactional(readOnly = true)
public VoteDetailResponse getVoteDetail(Integer voteId) {
    System.out.println("🔥 [BACKEND] getVoteDetail() 요청 들어옴 voteId=" + voteId);

    VoteEntity vote = voteRepository.findById(voteId)
            .orElseThrow(() -> new RuntimeException("Vote not found"));

    System.out.println("➡️ Vote title=" + vote.getTitle() + ", status=" + vote.getStatus());
    System.out.println("➡️ Issue summary=" + vote.getIssue().getAiSummary());
    
    IssueEntity issue = vote.getIssue();
    RssArticleEntity article = issue.getArticle();
    String category = "기타";
    String thumbnail = null;
    if (article != null) {
        category = article.getFeed() != null ? article.getFeed().getSourceName() : "뉴스";
        thumbnail = article.getThumbnailUrl();
    } else if (issue.getCommunityPost() != null) {
        category = "커뮤니티";
    }

    // rule 가져오기
    VoteRuleEntity rule = voteRuleRepository.findByVote(vote).orElse(null);

    // ==== 옵션 + 선택지 구성 ====
    List<VoteDetailResponse.OptionResponse> options =
            vote.getOptions().stream()
                    .map(option ->
                            VoteDetailResponse.OptionResponse.builder()
                                    .optionId(option.getId())
                                    .title(option.getOptionTitle())
                                    .choices(
                                            option.getChoices().stream()
                                                    .map(ch -> VoteDetailResponse.ChoiceResponse.builder()
                                                            .choiceId(ch.getId())
                                                            .text(ch.getChoiceText())
                                                            .pointsTotal(ch.getPointsTotal())
                                                            .participantsCount(ch.getParticipantsCount())
                                                            .odds(calculateOdds(ch, vote))
                                                            .build()
                                                    ).toList()
                                    )
                                    .build()
                    ).toList();

    return VoteDetailResponse.builder()
            .voteId(vote.getId())
            .issueId(issue.getId())
            .title(vote.getTitle())
            .description(issue.getAiSummary())
            .category(category)
            .thumbnail(thumbnail)
            .status(vote.getStatus().name())
            .createdAt(vote.getCreatedAt())
            .endAt(vote.getEndAt())

            .stats(
                    VoteDetailResponse.Stats.builder()
                            .totalPoints(vote.getTotalPoints())
                            .totalParticipants(vote.getTotalParticipants())
                            .build()
            )

            .rule(rule != null ?
                    VoteDetailResponse.Rule.builder()
                            .type(rule.getRuleType())
                            .description(rule.getRuleDescription())
                            .build() : null
            )

            .options(options)
            .build();
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
       🔹 4. 투표 참여
       =============================== */
    @Transactional
    public VoteDetailResponse participateVote(Integer voteId, VoteParticipateRequest req, Integer userId) {

        VoteOptionChoiceEntity choice = choiceRepository.findById(req.getChoiceId())
                .orElseThrow(() -> new RuntimeException("선택지 없음"));

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("user 없음"));

        // 같은 choice에 대해 이미 참여했는지 확인
if (voteUserRepository.existsByUserIdAndChoiceId(userId, req.getChoiceId())) {
    throw new RuntimeException("이미 이 선택지에 참여했습니다.");
}

// 같은 option에 대해 이미 참여했는지 확인
Long optionId = choice.getOption().getId();
if (voteUserRepository.existsByUserIdAndOptionId(userId, optionId)) {
    throw new RuntimeException("이미 이 옵션에 참여했습니다.");
}

        VoteUserEntity vu = VoteUserEntity.builder()
                .vote(choice.getOption().getVote())
                .user(user)
                .option(choice.getOption())
                .choice(choice)
                .pointsBet(req.getPoints())
                .build();

        voteUserRepository.save(vu);

        // 선택지 업데이트
        choice.setPointsTotal(choice.getPointsTotal() + req.getPoints());
        choice.setParticipantsCount(choice.getParticipantsCount() + 1);
        choiceRepository.save(choice);

        // 투표 전체 풀 업데이트
        VoteEntity vote = choice.getOption().getVote();
        vote.setTotalPoints(vote.getTotalPoints() + req.getPoints());
        vote.setTotalParticipants(vote.getTotalParticipants() + 1);
        voteRepository.save(vote);

        return getVoteDetail(voteId);
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
public VoteDetailResponse cancelMyVote(Long voteUserId, Integer userId) {

    VoteUserEntity voteUser = voteUserRepository.findById(voteUserId)
            .orElseThrow(() -> new RuntimeException("베팅 정보를 찾을 수 없습니다."));

    // 본인 확인
    if (!voteUser.getUser().getId().equals(userId)) {
        throw new RuntimeException("내 베팅만 취소할 수 있습니다.");
    }

    VoteEntity vote = voteUser.getVote();

    // 상태 체크
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

    return getVoteDetail(vote.getId());
}

@Transactional
public VoteDetailResponse cancelVote(Integer voteId, Integer userId) {

    VoteEntity vote = voteRepository.findById(voteId)
            .orElseThrow(() -> new RuntimeException("투표 없음"));

    // 상태 체크
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

    return getVoteDetail(voteId);
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

    logHistory(vote, VoteStatusHistoryEntity.Status.RESOLVED);

    return "정답이 확정되었습니다.";
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
