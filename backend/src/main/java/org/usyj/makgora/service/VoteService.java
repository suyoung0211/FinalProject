package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.*;
import org.usyj.makgora.repository.*;
import org.usyj.makgora.request.vote.VoteCreateRequest;
import org.usyj.makgora.request.vote.VoteParticipateRequest;
import org.usyj.makgora.response.vote.*;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VoteService {

    private final VoteRepository voteRepository;
    private final IssueRepository issueRepository;
    private final VoteOptionRepository voteOptionRepository;
    private final VoteUserRepository voteUserRepository;
    private final VotesStatusHistoryRepository voteStatusHistoryRepository;
    private final UserRepository userRepository;

    /* ==========================================================
     * 1) Issue → Vote 생성
     * ========================================================== */
    @Transactional
    public VoteResponse createVote(Integer issueId, VoteCreateRequest req, Integer userId) {

        IssueEntity issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        VoteEntity vote = VoteEntity.builder()
                .issue(issue)
                .title(req.getTitle())
                .status(VoteEntity.Status.ONGOING)
                .endAt(req.getEndAt())
                .build();

        voteRepository.save(vote);

        // 옵션 생성
        if (req.getType() == VoteCreateRequest.VoteType.YESNO) {
            createYesNoOptions(vote);
        } else {
            createMultiOptions(vote, req.getOptions());
        }

        List<VoteOptionEntity> options = voteOptionRepository.findByVote(vote);
        List<VoteOptionResultResponse> optionResults = buildOptionResults(options);
        long totalParticipants = voteUserRepository.countByVote(vote);

        return VoteResponse.of(vote, optionResults, totalParticipants);
    }

    private void createYesNoOptions(VoteEntity vote) {
        voteOptionRepository.save(VoteOptionEntity.builder().vote(vote).optionTitle("YES").build());
        voteOptionRepository.save(VoteOptionEntity.builder().vote(vote).optionTitle("NO").build());
    }

    private void createMultiOptions(VoteEntity vote, List<String> options) {
        if (options == null) return;

        for (String title : options) {
            voteOptionRepository.save(
                    VoteOptionEntity.builder()
                            .vote(vote)
                            .optionTitle(title)
                            .build()
            );
        }
    }

    /* ==========================================================
     * 2) Issue → Vote 전체 조회
     * ========================================================== */
    @Transactional(readOnly = true)
    public List<VoteResponse> getVotesByIssue(Integer issueId) {

        IssueEntity issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        List<VoteEntity> votes = voteRepository.findByIssue(issue);
        List<VoteResponse> result = new ArrayList<>();

        for (VoteEntity vote : votes) {
            List<VoteOptionEntity> options = voteOptionRepository.findByVote(vote);

            List<VoteOptionResultResponse> optionResults = buildOptionResults(options);
            long totalParticipants = voteUserRepository.countByVote(vote);

            result.add(VoteResponse.of(vote, optionResults, totalParticipants));
        }

        return result;
    }

    /* ==========================================================
     * 3) Vote 상세 조회
     * ========================================================== */
    @Transactional(readOnly = true)
    public VoteDetailResponse getVoteDetail(Integer voteId) {

        VoteEntity vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("Vote not found"));

        List<VoteOptionEntity> options = voteOptionRepository.findByVote(vote);
        List<VoteOptionResultResponse> optionResults = buildOptionResults(options);
        long totalParticipants = voteUserRepository.countByVote(vote);

        return VoteDetailResponse.of(vote, optionResults, totalParticipants);
    }

    /* ==========================================================
     * 4) 투표 참여
     * ========================================================== */
    @Transactional
    public VoteDetailResponse participateVote(Integer voteId, VoteParticipateRequest req, Integer userId) {

        VoteEntity vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("Vote not found"));

        if (vote.getStatus() != VoteEntity.Status.ONGOING)
            throw new RuntimeException("이미 종료된 투표입니다.");

        VoteOptionEntity option = voteOptionRepository.findById(req.getOptionId())
                .orElseThrow(() -> new RuntimeException("Option not found"));

        UserEntity user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getPoints() < req.getPoints())
            throw new RuntimeException("포인트가 부족합니다.");

        // 중복투표 방지 — repository에 맞게 변경
        if (voteUserRepository.existsByUserIdAndVoteId(userId, voteId))
            throw new RuntimeException("이미 이 투표에 참여했습니다.");

        // 포인트 차감
        user.setPoints(user.getPoints() - req.getPoints());
        userRepository.save(user);

        

        // 참여 기록
        VoteUserEntity voteUser = VoteUserEntity.builder()
                .vote(vote)
                .user(user)
                .option(option)
                .pointsBet(req.getPoints())
                .build();

        voteUserRepository.save(voteUser);

        // 통계 업데이트
        vote.setTotalPoints(vote.getTotalPoints() + req.getPoints());
        vote.setTotalParticipants(vote.getTotalParticipants() + 1);
        voteRepository.save(vote);

        return getVoteDetail(voteId);
    }

    /* ==========================================================
     * 5) 투표 종료(관리자 또는 자동)
     * ========================================================== */
    @Transactional
    public VoteDetailResponse closeVote(Integer voteId) {

        VoteEntity vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("Vote not found"));

        if (vote.getStatus() != VoteEntity.Status.ONGOING)
            throw new RuntimeException("이미 종료되었습니다.");

        vote.setStatus(VoteEntity.Status.FINISHED);
        voteRepository.save(vote);

        voteStatusHistoryRepository.save(
                VoteStatusHistoryEntity.builder()
                        .vote(vote)
                        .status("FINISHED")
                        .build()
        );

        return getVoteDetail(voteId);
    }

    /* ==========================================================
     * 6) 보상 배분
     * ========================================================== */
    @Transactional
    public void distributeRewards(Integer voteId) {

        VoteEntity vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("Vote not found"));

        if (vote.getStatus() != VoteEntity.Status.FINISHED)
            throw new RuntimeException("투표가 종료되지 않았습니다.");

        List<VoteOptionEntity> options = voteOptionRepository.findByVote(vote);

        // 승리 옵션(최다 득표)
        VoteOptionEntity winner = options.stream()
                .max((a, b) -> Long.compare(
                        voteUserRepository.countByOption(a),
                        voteUserRepository.countByOption(b)))
                .orElseThrow();

        // 승자들 목록 찾기
        List<VoteUserEntity> winners = voteUserRepository.findByOptionId(winner.getId());

        // 승자들의 총 배팅 금액
        long totalWinnerBet = winners.stream()
                .mapToLong(VoteUserEntity::getPointsBet)
                .sum();

        // 배당 포인트 분배
        for (VoteUserEntity vu : winners) {

            int userBet = vu.getPointsBet();
            int reward = (int) Math.round(((double) userBet / totalWinnerBet) * vote.getTotalPoints());

            UserEntity user = vu.getUser();
            user.setPoints(user.getPoints() + reward);
            userRepository.save(user);
        }
    }

    /* ==========================================================
     * 옵션별 투표수 / 비율 계산
     * ========================================================== */
    private List<VoteOptionResultResponse> buildOptionResults(List<VoteOptionEntity> options) {

        List<VoteOptionResultResponse> results = new ArrayList<>();
        long totalCount = 0;

        List<Long> counts = new ArrayList<>();

        for (VoteOptionEntity opt : options) {
            long count = voteUserRepository.countByOption(opt);
            counts.add(count);
            totalCount += count;
        }

        for (int i = 0; i < options.size(); i++) {
            long count = counts.get(i);

            int percent = (totalCount == 0)
                    ? 0
                    : (int) Math.round(count * 100.0 / totalCount);

            results.add(VoteOptionResultResponse.of(options.get(i), count, percent));
        }

        return results;
    }

    public List<VoteResponse> getAllVotes() {
    return voteRepository.findAll().stream()
        .map(VoteResponse::fromEntity)
        .toList();
}
}
