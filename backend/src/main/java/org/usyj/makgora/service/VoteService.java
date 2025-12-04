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

    private void logHistory(VoteEntity vote, VoteStatusHistoryEntity.Status status) {
    VoteStatusHistoryEntity history = VoteStatusHistoryEntity.builder()
            .vote(vote)
            .status(status)
            .statusDate(LocalDateTime.now())
            .build();
    historyRepository.save(history);
}

    /** 모든 투표 리스트 조회 */
    @Transactional(readOnly = true)
    public List<VoteResponse> getAllVotes() {
        List<VoteEntity> votes = voteRepository.findAll();
        return votes.stream()
                .map(v -> getVoteDetail(v.getId()))
                .toList();
    }

    @Transactional
public VoteResponse cancelMyVote(Long voteUserId, Integer userId) {

    VoteUserEntity voteUser = voteUserRepository.findById(voteUserId)
            .orElseThrow(() -> new RuntimeException("베팅 정보를 찾을 수 없습니다."));

    // → 본인 베팅만 취소 가능
    if (!voteUser.getUser().getId().equals(userId)) {
        throw new RuntimeException("내 베팅만 취소할 수 있습니다.");
    }

    VoteEntity vote = voteUser.getVote();

    // → 진행 중이어야 취소 가능
    if (vote.getStatus() != VoteEntity.Status.ONGOING) {
        throw new RuntimeException("진행중인 투표만 취소할 수 있습니다.");
    }

    // → 이미 취소 여부
    if (Boolean.TRUE.equals(voteUser.getIsCancelled())) {
        throw new RuntimeException("이미 취소된 베팅입니다.");
    }

    // → choice 통계 되돌리기
    VoteOptionChoiceEntity choice = voteUser.getChoice();
    choice.setPointsTotal(choice.getPointsTotal() - voteUser.getPointsBet());
    choice.setParticipantsCount(choice.getParticipantsCount() - 1);
    choiceRepository.save(choice);

    // → voteUser 상태 업데이트
    voteUser.setIsCancelled(true);
    voteUser.setUpdatedAt(LocalDateTime.now());
    voteUserRepository.save(voteUser);

    // → 최신 투표 정보 반환
    return getVoteDetail(vote.getId());
}


    /** 특정 Issue에 투표 생성 */
    @Transactional
    public VoteResponse createVote(Integer issueId, VoteCreateRequest req) {

        IssueEntity issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        VoteEntity vote = VoteEntity.builder()
                .issue(issue)
                .title(req.getTitle())
                .endAt(req.getEndAt())
                .status(VoteEntity.Status.ONGOING)
                .build();

        voteRepository.save(vote);

        List<VoteResponse.OptionResponse> optionResponses = new ArrayList<>();

        for (VoteCreateRequest.VoteOptionRequest opt : req.getOptions()) {

            VoteOptionEntity option = VoteOptionEntity.builder()
                    .vote(vote)
                    .optionTitle(opt.getOptionTitle())
                    .startDate(opt.getStartDate())
                    .endDate(opt.getEndDate())
                    .build();
            optionRepository.save(option);

            List<VoteResponse.ChoiceResponse> choiceResponses = new ArrayList<>();

            for (String ch : opt.getChoices()) {

                VoteOptionChoiceEntity choice = VoteOptionChoiceEntity.builder()
                        .option(option)
                        .choiceText(ch)
                        .pointsTotal(0)
                        .participantsCount(0)
                        .build();
                choiceRepository.save(choice);

                choiceResponses.add(
                        VoteResponse.ChoiceResponse.builder()
                                .choiceId(choice.getId())
                                .choiceText(choice.getChoiceText())
                                .pointsTotal(choice.getPointsTotal())
                                .participantsCount(choice.getParticipantsCount())
                                .odds(null)
                                .build()
                );
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
                .endAt(vote.getEndAt())
                .options(optionResponses)
                .build();
    }

    /** Issue 객체 기반 투표 목록 */
    public List<VoteEntity> getVotesByIssue(IssueEntity issue) {
        return voteRepository.findByIssue(issue);
    }

    /** Issue ID 기반 투표 목록 */
    @Transactional(readOnly = true)
    public List<VoteResponse> getVotesForIssue(Integer issueId) {

        IssueEntity issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        List<VoteEntity> votes = voteRepository.findByIssue(issue);

        return votes.stream()
                .map(v -> getVoteDetail(v.getId()))
                .toList();
    }

    /** 투표 상세 조회 */
    @Transactional(readOnly = true)
    public VoteResponse getVoteDetail(Integer voteId) {

        VoteEntity vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("Vote not found"));

        List<VoteResponse.OptionResponse> options = vote.getOptions()
                .stream()
                .map(option -> VoteResponse.OptionResponse.builder()
                        .optionId(option.getId())
                        .optionTitle(option.getOptionTitle())
                        .startDate(option.getStartDate())
                        .endDate(option.getEndDate())
                        .choices(
                                option.getChoices().stream()
                                        .map(ch -> VoteResponse.ChoiceResponse.builder()
                                                .choiceId(ch.getId())
                                                .choiceText(ch.getChoiceText())
                                                .pointsTotal(ch.getPointsTotal())
                                                .participantsCount(ch.getParticipantsCount())
                                                .odds(ch.getOdds())
                                                .build()
                                        ).toList()
                        )
                        .build()
                ).toList();

        return VoteResponse.builder()
                .voteId(vote.getId())
                .title(vote.getTitle())
                .endAt(vote.getEndAt())
                .options(options)
                .build();
    }

    /** 투표 참여 */
    @Transactional
    public VoteResponse participateVote(Integer voteId, VoteParticipateRequest req, Integer userId) {

        VoteOptionChoiceEntity choice = choiceRepository.findById(req.getChoiceId())
                .orElseThrow(() -> new RuntimeException("choice 없음"));

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("user 없음"));

        if (voteUserRepository.existsByUserAndChoice(user, choice)) {
            throw new RuntimeException("이미 이 선택지에 투표함");
        }

        VoteUserEntity vu = VoteUserEntity.builder()
                .vote(choice.getOption().getVote())
                .user(user)
                .option(choice.getOption())
                .choice(choice)
                .pointsBet(req.getPoints())
                .build();

        voteUserRepository.save(vu);

        choice.setPointsTotal(choice.getPointsTotal() + req.getPoints());
        choice.setParticipantsCount(choice.getParticipantsCount() + 1);
        choiceRepository.save(choice);

        VoteEntity vote = choice.getOption().getVote();
        vote.setTotalPoints(vote.getTotalPoints() + req.getPoints());
        vote.setTotalParticipants(vote.getTotalParticipants() + 1);
        voteRepository.save(vote);

        return getVoteDetail(voteId);
    }

    /** 내 투표 조회 */
    @Transactional(readOnly = true)
    public MyVoteResponse getMyVote(Integer voteId, Integer userId) {

        VoteEntity vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("vote 없음"));

        VoteUserEntity vu = voteUserRepository.findByUserIdAndVoteId(userId, voteId)
                .orElse(null);

        return MyVoteResponse.from(vote, vu);
    }

    /** 투표 취소 */
    @Transactional
    public VoteResponse cancelVote(Integer voteId, Integer userId) {

        VoteUserEntity vu = voteUserRepository
                .findByUserIdAndVoteId(userId, voteId)
                .orElseThrow(() -> new RuntimeException("투표 없음"));

        if (vu.getIsCancelled()) throw new RuntimeException("이미 취소됨");

        UserEntity user = vu.getUser();
        user.setPoints(user.getPoints() + vu.getPointsBet());
        userRepository.save(user);

        VoteOptionChoiceEntity choice = vu.getChoice();
        choice.setPointsTotal(choice.getPointsTotal() - vu.getPointsBet());
        choice.setParticipantsCount(choice.getParticipantsCount() - 1);
        choiceRepository.save(choice);

        vu.setIsCancelled(true);
        voteUserRepository.save(vu);

        return getVoteDetail(voteId);
    }

    /** 투표 종료 */
    @Transactional
    public String finishVote(Integer voteId) {
        VoteEntity vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("vote 없음"));

        if (vote.getStatus() != VoteEntity.Status.ONGOING)
            throw new RuntimeException("진행중인 투표만 종료할 수 있습니다.");

        vote.setStatus(VoteEntity.Status.FINISHED);
        voteRepository.save(vote);

        logHistory(vote, VoteStatusHistoryEntity.Status.FINISHED);
        return "투표 종료 완료";
    }

    /** 정답 확정 */
    @Transactional
    public String resolveVote(Integer voteId, Long choiceId) {

        VoteEntity vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("vote 없음"));

        if (vote.getStatus() != VoteEntity.Status.FINISHED) {
            throw new RuntimeException("마감된 투표만 정답 확정할 수 있습니다.");
        }

        VoteOptionChoiceEntity correctChoice = choiceRepository.findById(choiceId)
                .orElseThrow(() -> new RuntimeException("choice 없음"));

        if (vote.getCorrectChoice() != null) {
            throw new RuntimeException("이미 정답이 확정된 투표입니다.");
        }

        vote.setCorrectChoice(correctChoice);
        vote.setStatus(VoteEntity.Status.RESOLVED);
        voteRepository.save(vote);

        logHistory(vote, VoteStatusHistoryEntity.Status.RESOLVED);

        return "정답 확정 완료";
    }

    /** 보상 분배 */
    @Transactional
    public String rewardVote(Integer voteId) {

        VoteEntity vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("vote 없음"));

        if (vote.getStatus() != VoteEntity.Status.RESOLVED) {
            throw new RuntimeException("정답 확정된 투표만 정산할 수 있습니다.");
        }

        VoteOptionChoiceEntity correct = vote.getCorrectChoice();

        List<VoteUserEntity> allBets = voteUserRepository.findByVoteId(voteId)
                .stream()
                .filter(vu -> !Boolean.TRUE.equals(vu.getIsCancelled()))
                .toList();

        if (allBets.isEmpty()) {
            vote.setRewarded(true);
            vote.setStatus(VoteEntity.Status.REWARDED);
            voteRepository.save(vote);
            return "참여자가 없어 보상 없이 종료되었습니다.";
        }

        int totalPool = allBets.stream()
                .mapToInt(VoteUserEntity::getPointsBet)
                .sum();

        List<VoteUserEntity> winners = allBets.stream()
                .filter(vu -> vu.getChoice().getId().equals(correct.getId()))
                .toList();

        int correctPool = winners.stream()
                .mapToInt(VoteUserEntity::getPointsBet)
                .sum();

        if (correctPool == 0) {
            vote.setRewarded(true);
            vote.setStatus(VoteEntity.Status.REWARDED);
            voteRepository.save(vote);
            return "정답 선택자 없음 → 보상 없이 종료되었습니다.";
        }

        double odds = (double) totalPool / (double) correctPool;

        correct.setOdds(odds);
        choiceRepository.save(correct);

        double feeRate = vote.getFeeRate();

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
        return "보상 분배 완료";
    }

    /** 관리자: 투표 자체 취소 */
    @Transactional
    public VoteResponse cancelVoteAdmin(Integer voteId, VoteCancelRequest req) {

        VoteEntity vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("Vote not found"));

        if (vote.getStatus() == VoteEntity.Status.CANCELLED) {
            throw new RuntimeException("이미 취소된 투표입니다.");
        }

        vote.setStatus(VoteEntity.Status.CANCELLED);
        vote.setCancellationReason(req.getReason());
        voteRepository.save(vote);

        logHistory(vote, VoteStatusHistoryEntity.Status.CANCELLED);

        return getVoteDetail(voteId);
    }

    /** 배당률 계산 조회 */
    @Transactional(readOnly = true)
    public OddsResponse getOdds(Integer voteId) {

        VoteEntity vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("vote 없음"));

        int totalPoolTmp = 0;
        for (VoteOptionEntity option : vote.getOptions()) {
            for (VoteOptionChoiceEntity ch : option.getChoices()) {
                totalPoolTmp += ch.getPointsTotal();
            }
        }
        final int totalPool = totalPoolTmp;

        List<OddsResponse.ChoiceOdds> choiceList =
                vote.getOptions().stream()
                        .flatMap(option -> option.getChoices().stream())
                        .map(ch -> {
                            Double odds = null;
                            if (ch.getPointsTotal() != null
                                    && ch.getPointsTotal() > 0
                                    && totalPool > 0) {
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
                .choices(choiceList)
                .build();
    }

    /** 내가 참여한 모든 투표 조회 */
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

            if (isCancelled) {
                resultStatus = "CANCELLED";
                rewardAmount = 0;
            }

            else if (vote.getStatus() == VoteEntity.Status.REWARDED) {

                boolean win = vote.getCorrectChoice() != null &&
                        vote.getCorrectChoice().getId().equals(choice.getId());

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

            else if (vote.getStatus() == VoteEntity.Status.RESOLVED) {

                boolean win = vote.getCorrectChoice() != null &&
                        vote.getCorrectChoice().getId().equals(choice.getId());

                resultStatus = win ? "WIN" : "LOSE";
                rewardAmount = null;
            }

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

    /** 사용자 통계 API */
    @Transactional(readOnly = true)
    public VoteStatisticsResponse getMyStatistics(Integer userId) {

        List<VoteUserEntity> votes = voteUserRepository.findByUserId(userId);

        int wins = 0;
        int losses = 0;
        int pending = 0;

        int currentStreak = 0;
        int maxStreak = 0;

        List<VoteUserEntity> sorted = votes.stream()
                .filter(vu -> vu.getVote().getStatus() == VoteEntity.Status.REWARDED
                        || vu.getVote().getStatus() == VoteEntity.Status.RESOLVED)
                .sorted((a, b) -> b.getVote().getEndAt().compareTo(a.getVote().getEndAt()))
                .toList();

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
            .title(req.getQuestion())
            .status(status)
            .feeRate(req.getFeeRate() != null ? req.getFeeRate() : 0.10)
            .endAt(req.getEndAt())
            .build();

    voteRepository.save(vote);


    // ===== 2) 옵션 + 선택지 저장 =====
    List<VoteResponse.OptionResponse> optionResponses = new ArrayList<>();

    for (VoteAiCreateRequest.OptionDto opt : req.getOptions()) {

        // 옵션 저장
        VoteOptionEntity option = VoteOptionEntity.builder()
                .vote(vote)
                .optionTitle(opt.getTitle())
                .build();
        optionRepository.save(option);

        List<VoteResponse.ChoiceResponse> choiceResponses = new ArrayList<>();

        // 선택지 저장 (YES / NO / DRAW)
        for (String choiceText : opt.getChoices()) {

            VoteOptionChoiceEntity choice = VoteOptionChoiceEntity.builder()
                    .option(option)
                    .choiceText(choiceText)
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
                .ruleType(req.getRule().getType())
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
}
