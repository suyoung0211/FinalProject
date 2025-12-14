package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.*;
import org.usyj.makgora.exception.VoteException;
import org.usyj.makgora.repository.*;
import org.usyj.makgora.request.vote.*;
import org.usyj.makgora.response.vote.*;
import org.usyj.makgora.response.voteDetails.ExpectedOddsResponse;
import org.usyj.makgora.response.voteDetails.VoteDetailMainResponse;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class VoteService {

    private final VoteRepository voteRepository;
    private final VoteOptionRepository optionRepository;
    private final VoteOptionChoiceRepository choiceRepository;
    private final VoteUserRepository voteUserRepository;
    private final UserRepository userRepository;
    private final VoteDetailService voteDetailService;
    private final OddsService oddsService;
    private final IssueRepository issueRepository;

    /* =========================================================
       1️⃣ 투표 목록 조회
       ========================================================= */
    @Transactional(readOnly = true)
public List<VoteListItemResponse> getVoteList() {

    return voteRepository.findAll().stream().map(vote -> {

        IssueEntity issue = vote.getIssue();
        RssArticleEntity article =
                (issue != null) ? issue.getArticle() : null;

        // 🔹 카테고리 결정
        String category;
        if (article != null && article.getFeed() != null) {
            category = article.getFeed().getSourceName();
        } else if (issue != null && issue.getCommunityPost() != null) {
            category = "커뮤니티";
        } else {
            category = "기타";
        }

        String description =
                issue != null ? issue.getAiSummary() : null;

        String thumbnail =
                article != null ? article.getThumbnailUrl() : null;

        String url =
                article != null ? article.getLink() : null;

        // 🔹 옵션 / 선택지 매핑
        List<VoteListItemResponse.OptionItem> options =
                vote.getOptions().stream().map(option ->

                        VoteListItemResponse.OptionItem.builder()
                                .optionId(option.getId())
                                .title(option.getOptionTitle())
                                .choices(
                                        option.getChoices().stream().map(choice ->
                                                VoteListItemResponse.ChoiceItem.builder()
                                                        .choiceId(choice.getId())
                                                        .text(choice.getChoiceText())
                                                        .build()
                                        ).toList()
                                )
                                .build()

                ).toList();

        return VoteListItemResponse.builder()
                .id(vote.getId())
                .title(vote.getTitle())
                .category(category)
                .description(description)
                .thumbnail(thumbnail)
                .url(url)
                .endAt(vote.getEndAt())
                .status(vote.getStatus().name())
                .totalPoints(vote.getTotalPoints())
                .totalParticipants(vote.getTotalParticipants())
                .createdAt(vote.getCreatedAt())
                .options(options)
                .build();

    }).toList();
}

    /* =========================================================
       2️⃣ 투표 참여
       ========================================================= */
    @Transactional
    public VoteDetailMainResponse participateVote(
            Integer voteId,
            VoteParticipateRequest req,
            Integer userId
    ) {
        VoteOptionChoiceEntity choice = choiceRepository.findById(req.getChoiceId())
                .orElseThrow(() -> new VoteException("CHOICE_NOT_FOUND", "선택지를 찾을 수 없습니다."));

        VoteEntity vote = choice.getOption().getVote();

        if (!vote.getId().equals(voteId)) {
            throw new VoteException("INVALID_CHOICE", "해당 투표의 선택지가 아닙니다.");
        }

        if (vote.getStatus() != VoteEntity.Status.ONGOING) {
            throw new VoteException("VOTE_CLOSED", "진행 중인 투표만 참여할 수 있습니다.");
        }

        if (voteUserRepository.existsByUserIdAndVoteId(userId, voteId)) {
            throw new VoteException("ALREADY_VOTED", "이미 참여한 투표입니다.");
        }

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new VoteException("USER_NOT_FOUND", "유저 정보 없음"));

        if (user.getPoints() < req.getPoints()) {
            throw new VoteException("NOT_ENOUGH_POINTS", "포인트 부족");
        }

        /* 예상 배당률 */
        ExpectedOddsResponse expected =
                oddsService.getExpectedOdds(voteId, choice.getId().intValue(), req.getPoints());

        VoteUserEntity voteUser = VoteUserEntity.builder()
                .vote(vote)
                .user(user)
                .option(choice.getOption())
                .choice(choice)
                .pointsBet(req.getPoints())
                .oddsAtBet(expected.getExpectedOdds())
                .build();

        voteUserRepository.save(voteUser);

        // 포인트 차감
        user.setPoints(user.getPoints() - req.getPoints());
        userRepository.save(user);

        return voteDetailService.getVoteDetail(voteId, userId);
    }

    /* =========================================================
       3️⃣ 내 베팅 취소 (voteUserId)
       ========================================================= */
    @Transactional
    public VoteDetailMainResponse cancelMyVote(Long voteUserId, Integer userId) {

        VoteUserEntity vu = voteUserRepository.findById(voteUserId)
                .orElseThrow(() -> new RuntimeException("베팅 내역 없음"));

        if (!vu.getUser().getId().equals(userId)) {
            throw new RuntimeException("본인 베팅만 취소 가능");
        }

        if (Boolean.TRUE.equals(vu.getIsCancelled())) {
            throw new RuntimeException("이미 취소됨");
        }

        if (vu.getVote().getStatus() != VoteEntity.Status.ONGOING) {
            throw new RuntimeException("진행 중 투표만 취소 가능");
        }

        vu.setIsCancelled(true);
        vu.setUpdatedAt(LocalDateTime.now());
        voteUserRepository.save(vu);

        UserEntity user = vu.getUser();
        user.setPoints(user.getPoints() + vu.getPointsBet());
        userRepository.save(user);

        return voteDetailService.getVoteDetail(vu.getVote().getId(), userId);
    }

    /* =========================================================
       4️⃣ 투표 취소 (voteId)
       ========================================================= */
    @Transactional
    public VoteDetailMainResponse cancelVote(Integer voteId, Integer userId) {

        VoteUserEntity vu = voteUserRepository.findByUserIdAndVoteId(userId, voteId)
                .orElseThrow(() -> new RuntimeException("참여 내역 없음"));

        return cancelMyVote(vu.getId(), userId);
    }

    /* =========================================================
       5️⃣ 내 투표 목록
       ========================================================= */
    @Transactional(readOnly = true)
public List<MyVoteListResponse> getMyVotes(Integer userId) {

    List<VoteUserEntity> myVotes =
            voteUserRepository.findByUserId(userId);

    return myVotes.stream().map(vu -> {

        VoteEntity vote = vu.getVote();
        VoteOptionChoiceEntity choice = vu.getChoice();
        IssueEntity issue = vote.getIssue();

        String issueTitle =
                issue != null ? issue.getTitle() : null;

        String result;
        Integer rewardAmount = null;

        // 1️⃣ 취소
        if (Boolean.TRUE.equals(vu.getIsCancelled())) {
            result = "CANCELLED";
            rewardAmount = 0;
        }

        // 2️⃣ 정산 완료
        else if (vote.getStatus() == VoteEntity.Status.REWARDED) {

            boolean win =
                choice != null &&
                choice.getOption() != null &&
                choice.getOption().getCorrectChoice() != null &&
                choice.getId().equals(
                choice.getOption().getCorrectChoice().getId()
            );

            if (win) {
                result = "WIN";
                // 👉 이미 정산 시 지급된 값 기준
                rewardAmount = vu.getRewardPoints() != null
                        ? vu.getRewardPoints()
                        : 0;
            } else {
                result = "LOSE";
                rewardAmount = -vu.getPointsBet();
            }
        }

        // 3️⃣ 그 외 (ONGOING / FINISHED / RESOLVED)
        else {
            result = "PENDING";
        }

        return MyVoteListResponse.builder()
                .voteUserId(vu.getId())
                .voteId(vote.getId())
                .voteTitle(vote.getTitle())
                .issueTitle(issueTitle)
                .choiceId(choice != null ? choice.getId() : null)
                .choiceText(choice != null ? choice.getChoiceText() : null)
                .pointsBet(vu.getPointsBet())
                .rewardAmount(rewardAmount)
                .result(result)
                .voteCreatedAt(vote.getCreatedAt())
                .voteEndAt(vote.getEndAt())
                .voteStatus(vote.getStatus().name())
                .build();

    }).toList();
}

    /* =========================================================
       6️⃣ 내 통계
       ========================================================= */
    @Transactional(readOnly = true)
    public VoteStatisticsResponse getMyStatistics(Integer userId) {

        List<VoteUserEntity> list = voteUserRepository.findByUserId(userId);

        int wins = 0, losses = 0, pending = 0;

        for (VoteUserEntity vu : list) {

            VoteEntity vote = vu.getVote();

            if (Boolean.TRUE.equals(vu.getIsCancelled())) {
                pending++;
                continue;
            }

            if (vote.getStatus() == VoteEntity.Status.REWARDED) {
                boolean win = vu.getChoice() != null &&
                        vu.getChoice().equals(vu.getOption().getCorrectChoice());
                if (win) wins++;
                else losses++;
            } else {
                pending++;
            }
        }

        return VoteStatisticsResponse.builder()
                .wins(wins)
                .losses(losses)
                .pending(pending)
                .totalBets(list.size())
                .winRate((wins + losses) > 0 ? (double) wins / (wins + losses) : 0.0)
                .build();
    }

    /* =========================================================
       7️⃣ 유저 투표 생성
       ========================================================= */
    @Transactional
    public VoteResponse createVoteByUser(UserVoteCreateRequest req, Integer userId) {

        VoteEntity vote = VoteEntity.builder()
                .title(req.getTitle())
                .status(VoteEntity.Status.ONGOING)
                .feeRate(0.10)
                .endAt(req.getEndAt())
                .build();

        voteRepository.save(vote);

        List<VoteResponse.OptionResponse> options =
                req.getOptions().stream().map(opt -> {

                    VoteOptionEntity option = VoteOptionEntity.builder()
                            .vote(vote)
                            .optionTitle(opt.getTitle())
                            .build();
                    optionRepository.save(option);

                    List<VoteResponse.ChoiceResponse> choices =
                            opt.getChoices().stream().map(text -> {

                                VoteOptionChoiceEntity choice = VoteOptionChoiceEntity.builder()
                                        .option(option)
                                        .choiceText(text)
                                        .build();

                                choiceRepository.save(choice);
                                return VoteResponse.ChoiceResponse.fromEntity(choice);
                            }).toList();

                    return VoteResponse.OptionResponse.builder()
                            .optionId(option.getId())
                            .optionTitle(option.getOptionTitle())
                            .choices(choices)
                            .build();
                }).toList();

        return VoteResponse.builder()
                .voteId(vote.getId())
                .title(vote.getTitle())
                .status(vote.getStatus().name())
                .endAt(vote.getEndAt())
                .rewarded(false)
                .options(options)
                .build();
    }

    /* =========================================================
   🔹 AI 자동 생성 투표 (Python Worker / Admin 전용)
   ========================================================= */
@Transactional
public VoteResponse createVoteByAI(VoteAiCreateRequest req) {

    IssueEntity issue = issueRepository.findById(req.getIssueId())
            .orElseThrow(() -> new RuntimeException("Issue not found"));

    VoteEntity.Status status = VoteEntity.Status.REVIEWING;
    if (req.getInitialStatus() != null) {
        try {
            status = VoteEntity.Status.valueOf(req.getInitialStatus());
        } catch (Exception ignore) {}
    }

    VoteEntity vote = VoteEntity.builder()
            .issue(issue)
            .title(req.getQuestion())
            .status(status)
            .feeRate(req.getFeeRate() != null ? req.getFeeRate() : 0.10)
            .endAt(req.getEndAt())
            .build();

    voteRepository.save(vote);

    List<VoteResponse.OptionResponse> optionResponses = new ArrayList<>();

    for (VoteAiCreateRequest.OptionDto opt : req.getOptions()) {

        VoteOptionEntity option = VoteOptionEntity.builder()
                .vote(vote)
                .optionTitle(opt.getTitle())
                .build();
        optionRepository.save(option);

        List<VoteResponse.ChoiceResponse> choiceResponses = new ArrayList<>();

        for (String choiceText : opt.getChoices()) {

            VoteOptionChoiceEntity choice = VoteOptionChoiceEntity.builder()
                    .option(option)
                    .choiceText(choiceText)
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
public void finishVote(Integer voteId) {

    VoteEntity vote = voteRepository.findById(voteId)
            .orElseThrow(() -> new RuntimeException("투표 없음"));

    if (vote.getStatus() != VoteEntity.Status.ONGOING) {
        return; // 이미 마감됐으면 스킵
    }

    vote.setStatus(VoteEntity.Status.FINISHED);
    vote.setUpdatedAt(LocalDateTime.now());

    voteRepository.save(vote);

    log.info("[VoteService] 투표 자동 마감 완료 voteId={}", voteId);
}
}
