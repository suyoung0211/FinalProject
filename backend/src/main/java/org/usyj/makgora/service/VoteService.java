package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.IssueEntity;
import org.usyj.makgora.entity.UserEntity;
import org.usyj.makgora.entity.VoteEntity;
import org.usyj.makgora.entity.VoteOptionChoiceEntity;
import org.usyj.makgora.entity.VoteOptionEntity;
import org.usyj.makgora.entity.VoteUserEntity;
import org.usyj.makgora.entity.VoteStatusHistoryEntity;
import org.usyj.makgora.repository.*;
import org.usyj.makgora.request.vote.VoteCreateRequest;
import org.usyj.makgora.request.vote.VoteParticipateRequest;
import org.usyj.makgora.response.vote.VoteResponse;
import org.usyj.makgora.response.vote.MyVoteResponse;
import org.usyj.makgora.request.vote.VoteCancelRequest;
import org.usyj.makgora.response.vote.OddsResponse;
import org.usyj.makgora.response.vote.MyVoteListResponse;
import org.usyj.makgora.response.vote.VoteStatisticsResponse;

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
    private final VotesStatusHistoryRepository historyRepository;

    private void logHistory(VoteEntity vote, String status) {
    VoteStatusHistoryEntity history = VoteStatusHistoryEntity.builder()
            .vote(vote)
            .status(status)
            .statusDate(LocalDateTime.now())
            .build();

    historyRepository.save(history);
}

    /** 🔥 1) 특정 Issue에 투표 생성 */
    @Transactional
    public VoteResponse createVote(Integer issueId, VoteCreateRequest req) {

        IssueEntity issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        // Vote 생성
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
                                .pointsTotal(0)
                                .participantsCount(0)
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

    /** 🔹 2) Issue 객체 기반 투표 목록 가져오기 */
    public List<VoteEntity> getVotesByIssue(IssueEntity issue) {
        return voteRepository.findByIssue(issue);
    }

    /** 🔹 3) Issue ID 기반 투표 목록 → VoteResponse로 변환 */
    @Transactional(readOnly = true)
    public List<VoteResponse> getVotesForIssue(Integer issueId) {

        IssueEntity issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        List<VoteEntity> votes = voteRepository.findByIssue(issue);

        return votes.stream()
                .map(v -> getVoteDetail(v.getId()))
                .toList();
    }

    /** 🔹 투표 상세 조회 */
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

    /** ② 투표 참여 */
    @Transactional
public VoteResponse participateVote(Integer voteId, VoteParticipateRequest req, Integer userId) {

    VoteOptionChoiceEntity choice = choiceRepository.findById(req.getChoiceId())
            .orElseThrow(() -> new RuntimeException("choice 없음"));

    UserEntity user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("user 없음"));

    // 중복 선택 방지
    if (voteUserRepository.existsByUserAndChoice(user, choice)) {
        throw new RuntimeException("이미 이 선택지에 투표함");
    }

    // 투표 기록 저장
    VoteUserEntity vu = VoteUserEntity.builder()
            .vote(choice.getOption().getVote())
            .user(user)
            .option(choice.getOption())
            .choice(choice)
            .pointsBet(req.getPoints())
            .build();

    voteUserRepository.save(vu);

    // 선택지 통계 업데이트
    choice.setPointsTotal(choice.getPointsTotal() + req.getPoints());
    choice.setParticipantsCount(choice.getParticipantsCount() + 1);
    choiceRepository.save(choice);

    // -----------------------------
    // vote 총 포인트/참여자 수 증가 (신규 추가)
    // -----------------------------
    VoteEntity vote = choice.getOption().getVote();
    vote.setTotalPoints(vote.getTotalPoints() + req.getPoints());
    vote.setTotalParticipants(vote.getTotalParticipants() + 1);
    voteRepository.save(vote);

    return getVoteDetail(voteId);
}

    /** ③ 내 투표 조회 */
    @Transactional(readOnly = true)
    public MyVoteResponse getMyVote(Integer voteId, Integer userId) {
        VoteEntity vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("vote 없음"));

        VoteUserEntity vu = voteUserRepository.findByUserIdAndVoteId(userId, voteId)
                .orElse(null);

        return MyVoteResponse.from(vote, vu);
    }

    /** ④ 투표 취소 */
    @Transactional
    public VoteResponse cancelVote(Integer voteId, Integer userId) {

        VoteUserEntity vu = voteUserRepository
                .findByUserIdAndVoteId(userId, voteId)
                .orElseThrow(() -> new RuntimeException("투표 없음"));

        if (vu.getIsCancelled()) throw new RuntimeException("이미 취소됨");

        // 포인트 환불
        UserEntity user = vu.getUser();
        user.setPoints(user.getPoints() + vu.getPointsBet());
        userRepository.save(user);

        // 통계 롤백
        VoteOptionChoiceEntity choice = vu.getChoice();
        choice.setPointsTotal(choice.getPointsTotal() - vu.getPointsBet());
        choice.setParticipantsCount(choice.getParticipantsCount() - 1);
        choiceRepository.save(choice);

        vu.setIsCancelled(true);
        voteUserRepository.save(vu);

        return getVoteDetail(voteId);
    }

    /** ⑨ 투표 종료 */
    @Transactional
public String finishVote(Integer voteId) {
    VoteEntity vote = voteRepository.findById(voteId)
            .orElseThrow(() -> new RuntimeException("vote 없음"));

    if (vote.getStatus() != VoteEntity.Status.ONGOING)
        throw new RuntimeException("진행중인 투표만 종료할 수 있습니다.");

    vote.setStatus(VoteEntity.Status.FINISHED);
        voteRepository.save(vote);

        logHistory(vote, "FINISHED");

    return "투표 종료 완료";
}

    /** ⑩ 정답 확정 */
@Transactional
public String resolveVote(Integer voteId, Long choiceId) {

    VoteEntity vote = voteRepository.findById(voteId)
            .orElseThrow(() -> new RuntimeException("vote 없음"));

    // FINISHED 상태에서만 정답 확정 가능하도록
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
    vote.setCancellationReason("정답 확정: " + correctChoice.getChoiceText());

    voteRepository.save(vote);
    
logHistory(vote, "RESOLVED");

    return "정답 확정 완료";
}


    /** ⑪ 보상 분배 (관리자 or 스케줄러에서 호출) */
@Transactional
public String rewardVote(Integer voteId) {

    VoteEntity vote = voteRepository.findById(voteId)
            .orElseThrow(() -> new RuntimeException("vote 없음"));

    // 상태 체크
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

    // ======================
    // ⭐ 배당률 계산
    // ======================
    double odds = (double) totalPool / (double) correctPool;

    // ======================
    // ⭐ 정답 선택지에 odds 저장
    // ======================
    correct.setOdds(odds);
    choiceRepository.save(correct);

    // ======================
    // ⭐ 보상 지급 (수수료 반영)
    // ======================
    double feeRate = vote.getFeeRate(); // ex) 0.10

    for (VoteUserEntity vu : winners) {
        UserEntity user = vu.getUser();

        int originalReward = (int) Math.floor(vu.getPointsBet() * odds);
        int rewardAfterFee = (int) Math.floor(originalReward * (1 - feeRate));

        user.setPoints(user.getPoints() + rewardAfterFee);
        userRepository.save(user);
    }

    // ======================
    // ⭐ 투표 상태 업데이트
    // ======================
    vote.setRewarded(true);
    vote.setStatus(VoteEntity.Status.REWARDED);
    voteRepository.save(vote);
    logHistory(vote, "REWARDED");
    

    return "보상 분배 완료 (배당률 저장됨)";
}

    @Transactional
public VoteResponse cancelVote(Integer voteId, VoteCancelRequest req) {

    VoteEntity vote = voteRepository.findById(voteId)
            .orElseThrow(() -> new RuntimeException("Vote not found"));

    // 이미 취소된 투표면 예외
    if (vote.getStatus() == VoteEntity.Status.CANCELLED) {
        throw new RuntimeException("이미 취소된 투표입니다.");
    }

    vote.setStatus(VoteEntity.Status.CANCELLED);
    vote.setCancellationReason(req.getReason());
    voteRepository.save(vote);

    return getVoteDetail(voteId); // 취소된 상태로 반환
}

@Transactional
public VoteResponse cancelMyVote(Long voteUserId, Integer userId) {

    VoteUserEntity voteUser = voteUserRepository.findById(voteUserId)
            .orElseThrow(() -> new RuntimeException("베팅 정보가 없습니다."));

    if (!voteUser.getUser().getId().equals(userId)) {
        throw new RuntimeException("내 베팅만 취소할 수 있습니다.");
    }

    if (voteUser.getVote().getStatus() != VoteEntity.Status.ONGOING) {
    throw new RuntimeException("진행중 투표만 취소할 수 있습니다.");
}

    if (voteUser.getIsCancelled()) {
        throw new RuntimeException("이미 취소된 베팅입니다.");

    }

    VoteOptionChoiceEntity choice = voteUser.getChoice();

    // 통계 되돌리기
    choice.setPointsTotal(choice.getPointsTotal() - voteUser.getPointsBet());
    choice.setParticipantsCount(choice.getParticipantsCount() - 1);
    choiceRepository.save(choice);

    // 취소 처리
    voteUser.setIsCancelled(true);
    voteUser.setUpdatedAt(java.time.LocalDateTime.now());
    voteUserRepository.save(voteUser);

    return getVoteDetail(voteUser.getVote().getId());
}

/** ⑤ 관리자: 투표 자체를 취소 */
@Transactional
public VoteResponse cancelVoteAdmin(Integer voteId, VoteCancelRequest req) {

    VoteEntity vote = voteRepository.findById(voteId)
            .orElseThrow(() -> new RuntimeException("Vote not found"));

    // 이미 취소된 투표인지 확인
    if (vote.getStatus() == VoteEntity.Status.CANCELLED) {
        throw new RuntimeException("이미 취소된 투표입니다.");
    }

    // 취소 처리
    vote.setStatus(VoteEntity.Status.CANCELLED);
    vote.setCancellationReason(req.getReason());
    voteRepository.save(vote);

    logHistory(vote, "CANCELLED");

    // 만약 VoteStatusHistoryEntity 사용한다면 로그 남기기
    // (선택 사항. 필요 없으면 삭제 가능)
    /*
    VoteStatusHistoryEntity history = VoteStatusHistoryEntity.builder()
            .vote(vote)
            .status("CANCELLED")
            .statusDate(LocalDateTime.now())
            .build();
    voteStatusHistoryRepository.save(history);
    */

    // 취소된 후의 상세 조회 반환
    return getVoteDetail(voteId);
}

@Transactional(readOnly = true)
public OddsResponse getOdds(Integer voteId) {

    VoteEntity vote = voteRepository.findById(voteId)
            .orElseThrow(() -> new RuntimeException("vote 없음"));

    // 1) 전체 pool 계산
    int totalPoolTmp = 0;
    for (VoteOptionEntity option : vote.getOptions()) {
        for (VoteOptionChoiceEntity ch : option.getChoices()) {
            totalPoolTmp += ch.getPointsTotal();
        }
    }
    final int totalPool = totalPoolTmp;  // 🔥 effectively final 처리
    
    // 2) 선택지별 odds 계산
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

// 내가 참여한 모든 투표 조회
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

        // ==============================
        // ① 취소된 경우
        // ==============================
        if (isCancelled) {
            resultStatus = "CANCELLED";
            rewardAmount = 0;
        }

        // ==============================
        // ② 정산이 완료된 경우 → 즉 WIN/LOSE + 금액 계산됨
        // ==============================
        else if (vote.getStatus() == VoteEntity.Status.REWARDED) {

            boolean win = vote.getCorrectChoice() != null &&
                    vote.getCorrectChoice().getId().equals(choice.getId());

            // ⚠️ findByVoteId() 1회 호출 → 재사용 가능
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

                rewardAmount = rewardAfterFee - vu.getPointsBet(); // 순이익(+)
            } else {
                resultStatus = "LOSE";
                rewardAmount = -vu.getPointsBet(); // 순손실(-)
            }
        }

        // ==============================
        // ③ 정답은 확정되었지만 아직 정산 전
        // ==============================
        else if (vote.getStatus() == VoteEntity.Status.RESOLVED) {

            boolean win = vote.getCorrectChoice() != null &&
                    vote.getCorrectChoice().getId().equals(choice.getId());

            resultStatus = win ? "WIN" : "LOSE";
            rewardAmount = null;  // 정산 전이므로 금액 없음
        }

        // ==============================
        // ④ 아직 진행중 (베팅한 상태)
        // ==============================
        else {
            resultStatus = "PENDING";
            rewardAmount = null;
        }

        return MyVoteListResponse.builder()
        // 🆔 이 베팅 내역(vote_user_id)의 PK
        .voteUserId(vu.getId())
        // 🗳 이 베팅이 속한 vote_id
        .voteId(vote.getId())
        // 🏷 투표 제목 (예: “비트코인 다음 주 상승할까?”)
        .voteTitle(vote.getTitle())
        // 📰 이 투표가 속한 이슈의 제목
        .issueTitle(issueTitle)
        // 🆔 내가 찍은 choice_id
        .choiceId(choice.getId())
        // 📝 내가 선택한 선택지 텍스트 (예: “상승한다”)
        .choiceText(choice.getChoiceText())
        // 💰 내가 걸었던 포인트 금액
        .pointsBet(vu.getPointsBet())
        // 📊 정산 후 내 순이익/순손실 값 (예: +120 / -100)
        // • 정산 전이라면 null
        // • 취소되면 0
        .rewardAmount(rewardAmount)
        // 🏆 결과 WIN / LOSE / PENDING / CANCELLED
        .result(resultStatus)
        // ⭐ 투표 생성일 추가
        .voteCreatedAt(vote.getCreatedAt())   
        // ⏳ 투표 종료 날짜/시간
        .voteEndAt(vote.getEndAt())
        // 📌 투표 상태 (ONGOING / RESOLVED / REWARDED / CANCELLED)
        .voteStatus(vote.getStatus().name())
        .build();
    }).toList();
}

// 사용자 통계 APi
@Transactional(readOnly = true)
public VoteStatisticsResponse getMyStatistics(Integer userId) {

    List<VoteUserEntity> votes = voteUserRepository.findByUserId(userId);

    int wins = 0;
    int losses = 0;
    int pending = 0;

    int currentStreak = 0;
    int maxStreak = 0;

    // 종료된 투표만 정렬해서 streak 계산
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

    // streak 계산
    for (VoteUserEntity vu : sorted) {

        VoteEntity vote = vu.getVote();

        if (vote.getCorrectChoice() == null) break;

        boolean win = vu.getChoice().getId().equals(vote.getCorrectChoice().getId());

        if (win) {
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
        } else {
            break; // 연속 끊김
        }
    }

    int total = wins + losses + pending;

    return VoteStatisticsResponse.builder()
            // 📌 유저가 참여한 전체 투표 수 (취소 + 진행중 + 승리 + 패배 다 포함)
            .totalBets(total)
            // 🏆 유저가 이긴 투표 횟수 (정답 선택 = 본인 선택)
            .wins(wins)
            // ❌ 유저가 진 투표 횟수 (정답 선택 ≠ 본인 선택)
            .losses(losses)
            // ⏳ 진행 중 / 정답 미확정 / 취소된 투표 수
            .pending(pending)
            // 📊 승률 = 승리 / (승 + 패)
            //    (진행중/취소는 승률에서 제외)
            .winRate(total > 0 ? (double) wins / (wins + losses) : 0.0)
            // 🔥 현재 진행 중인 연승 기록 (가장 최근 투표부터 연속 승리한 횟수)
            .currentWinStreak(currentStreak)
            // 🏅 유저가 기록한 최대 연승 기록
            .maxWinStreak(maxStreak)
            .build();
}



}
