package org.usyj.makgora.profile.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.community.repository.CommunityPostRepository;
import org.usyj.makgora.dto.UnifiedCommentResponse;
import org.usyj.makgora.dto.UnifiedCommentResponse.CommentSource;
import org.usyj.makgora.entity.CommunityPostEntity;
import org.usyj.makgora.entity.UserEntity;
import org.usyj.makgora.entity.VoteEntity;
import org.usyj.makgora.entity.VoteOptionChoiceEntity;
import org.usyj.makgora.entity.VoteUserEntity;
import org.usyj.makgora.profile.dto.RecentCommunityActivityResponse;
import org.usyj.makgora.profile.dto.RecentCommunityActivityResponse.CommunityActivityType;
import org.usyj.makgora.profile.dto.RecentVoteActivityResponse;
import org.usyj.makgora.repository.UserRepository;
import org.usyj.makgora.repository.VoteUserRepository;
import org.usyj.makgora.service.UnifiedCommentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProfileActivityService {

    private final CommunityPostRepository postRepository;
    private final UserRepository userRepository;
    private final VoteUserRepository voteUserRepository;
    private final UnifiedCommentService unifiedCommentService;

    @Transactional(readOnly = true)
public List<RecentCommunityActivityResponse> getRecentCommunityActivities(Integer userId, int limit) {

    UserEntity user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

    List<RecentCommunityActivityResponse> result = new ArrayList<>();

    // 1) 내가 작성한 글 (기존 그대로)
    List<CommunityPostEntity> posts =
            postRepository.findByUserOrderByCreatedAtDesc(user);

    posts.forEach(post -> result.add(
            RecentCommunityActivityResponse.builder()
                    .activityId(post.getPostId())
                    .type(CommunityActivityType.POST)
                    .postId(post.getPostId())
                    .postTitle(post.getTitle())
                    .contentPreview(cut(post.getContent()))
                    .createdAt(post.getCreatedAt())
                    .build()
    ));

    // 🔥 2) 내가 작성한 댓글 - UnifiedCommentService 사용
    List<UnifiedCommentResponse> userComments =
            unifiedCommentService.getUserComments(userId);

    userComments.stream()
            // ✅ 커뮤니티 댓글만 필터링
            .filter(c -> c.getSource() == CommentSource.COMMUNITY)
            .forEach(c -> result.add(
                    RecentCommunityActivityResponse.builder()
                            .activityId(c.getCommentId())
                            .type(CommunityActivityType.COMMENT)
                            .postId(c.getSourceId())          // 커뮤니티에서는 postId
                            .postTitle(c.getSourceTitle())    // 게시글 제목
                            .contentPreview(cut(c.getContent()))
                            .createdAt(c.getCreatedAt())
                            .build()
            ));

    // 3) 전체를 시간순으로 정렬하고 limit만큼 자르기 (기존 로직 유지)
    return result.stream()
            .sorted(Comparator.comparing(RecentCommunityActivityResponse::getCreatedAt).reversed())
            .limit(limit)
            .toList();
}

    /**
     * 프로필 > 최근 활동(투표)
     * - Vote_Users 기반으로 "내가 베팅한 투표"들을 시간순으로 정리해서 반환
     * - MyVoteListResponse 로직을 단순화해서, 최근 활동용 요약으로 사용
     */
    @Transactional(readOnly = true)
    public List<RecentVoteActivityResponse> getRecentVoteActivities(Integer userId, int limit) {

        // 내가 참여한 모든 투표 내역
        List<VoteUserEntity> myVotes = voteUserRepository.findByUserId(userId);

        List<RecentVoteActivityResponse> result = new ArrayList<>();

        for (VoteUserEntity vu : myVotes) {

            VoteEntity vote = vu.getVote();
            VoteOptionChoiceEntity choice = vu.getChoice();

            String issueTitle = vote.getIssue() != null
                    ? vote.getIssue().getTitle()
                    : null;

            String resultStatus;
            Integer rewardAmount = null;

            boolean isCancelled = Boolean.TRUE.equals(vu.getIsCancelled());

            // ① 취소된 베팅
            if (isCancelled) {
                resultStatus = "CANCELLED";
                rewardAmount = 0;
            }
            // ② 정산까지 끝난 투표 → WIN / LOSE + 금액 계산
            else if (vote.getStatus() == VoteEntity.Status.REWARDED) {

                boolean win = vote.getCorrectChoice() != null &&
                        vote.getCorrectChoice().getId().equals(choice.getId());

                // 같은 voteId에 참여한 모든 베팅 재조회 (성능 이슈 크지 않다고 가정)
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

                double odds = correctPool > 0
                        ? (double) totalPool / (double) correctPool
                        : 0.0;

                double feeRate = vote.getFeeRate();

                if (win) {
                    resultStatus = "WIN";

                    int originalReward = (int) Math.floor(vu.getPointsBet() * odds);
                    int rewardAfterFee = (int) Math.floor(originalReward * (1 - feeRate));

                    // 순이익(+)
                    rewardAmount = rewardAfterFee - vu.getPointsBet();
                } else {
                    resultStatus = "LOSE";
                    // 순손실(-)
                    rewardAmount = -vu.getPointsBet();
                }
            }
            // ③ 정답은 확정되었지만 아직 정산 전
            else if (vote.getStatus() == VoteEntity.Status.RESOLVED) {

                boolean win = vote.getCorrectChoice() != null &&
                        vote.getCorrectChoice().getId().equals(choice.getId());

                resultStatus = win ? "WIN" : "LOSE";
                rewardAmount = null; // 정산 전이라 금액은 아직 모름
            }
            // ④ 진행중 or 마감 전
            else {
                resultStatus = "PENDING";
                rewardAmount = null;
            }

            result.add(
                    RecentVoteActivityResponse.builder()
                            .voteUserId(vu.getId().intValue())
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
                            .createdAt(vu.getCreatedAt())
                            .build()
            );
        }

        // 최신 베팅 순으로 정렬 후 limit만큼 리턴
        return result.stream()
                .sorted(Comparator.comparing(RecentVoteActivityResponse::getCreatedAt).reversed())
                .limit(limit)
                .toList();
    }

    private String cut(String content) {
        if (content == null) return "";
        return content.length() > 50 ? content.substring(0, 50) + "..." : content;
    }
}
