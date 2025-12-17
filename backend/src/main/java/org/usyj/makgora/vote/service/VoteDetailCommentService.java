package org.usyj.makgora.vote.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.user.entity.UserEntity;
import org.usyj.makgora.user.repository.UserRepository;
import org.usyj.makgora.vote.dto.voteDetailResponse.VoteDetailCommentResponse;
import org.usyj.makgora.vote.entity.VoteCommentEntity;
import org.usyj.makgora.vote.entity.VoteEntity;
import org.usyj.makgora.vote.repository.VoteCommentRepository;
import org.usyj.makgora.vote.repository.VoteRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class VoteDetailCommentService {

    private final VoteRepository voteRepository;
    private final UserRepository userRepository;
    private final VoteCommentRepository voteCommentRepository;

    private final StringRedisTemplate redis;

    /* ================================
       🔑 Redis Key Builder
       ================================ */
    private String likeKey(Long id) { return "VOTE_COMMENT:" + id + ":LIKE"; }
    private String dislikeKey(Long id) { return "VOTE_COMMENT:" + id + ":DISLIKE"; }
    private String likeUserKey(Long id) { return "VOTE_COMMENT_LIKED:" + id; }
    private String dislikeUserKey(Long id) { return "VOTE_COMMENT_DISLIKED:" + id; }
    private String countKey(Object id) { return "VOTE_COMMENT_COUNT:" + id; }

    private int getRedisInt(String v) {
        if (v == null) return 0;
        try { return Integer.parseInt(v); }
        catch (Exception e) { return 0; }
    }

    /* ================================
       🔥 공통 댓글 생성 (AI Vote 전용)
       ================================ */
    private VoteCommentEntity createComment(
            VoteEntity vote,
            UserEntity user,
            VoteCommentEntity parent,
            String content,
            String position,
            String userPosition
    ) {

        VoteCommentEntity comment = VoteCommentEntity.builder()
                .vote(vote)
                .issue(vote.getIssue())   // Issue 연동
                .user(user)
                .content(content)
                .position(position)
                .userPosition(userPosition)
                .parent(parent)
                .likeCount(0)
                .dislikeCount(0)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .isDeleted(false)
                .build();

        return voteCommentRepository.save(comment);
    }

    /* ================================
       🔥 AI Vote 댓글 등록
       ================================ */
    public VoteDetailCommentResponse addCommentToVote(
            Integer voteId, Integer userId, String content,
            Integer parentId, String position, String userPosition,
            Long linkedChoiceId   // 지금은 사용 X, 확장용
    ) {

        VoteEntity vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("Vote not found"));

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        VoteCommentEntity parent = null;
        if (parentId != null) {
            parent = voteCommentRepository.findById(parentId.longValue())
                    .orElseThrow(() -> new RuntimeException("Parent not found"));
        }

        VoteCommentEntity comment =
                createComment(vote, user, parent, content, position, userPosition);

        // 전체 댓글 수 카운트 (필요시 사용)
        redis.opsForValue().increment(countKey(voteId));

        // 작성자는 바로 myLike/myDislike 계산 위해 userId 같이 넘김
        return convertTreeNode(comment, userId);
    }

    /* ================================
       🔥 댓글 조회 (오버로드 2종)
       ================================ */

    // 컨트롤러에서 쓰는 기본 버전 : userId 없이
    @Transactional(readOnly = true)
    public List<VoteDetailCommentResponse> getComments(Integer voteId) {
        return getComments(voteId, null);
    }

    // 필요 시 userId까지 받아서 myLike/myDislike 반영 가능
    @Transactional(readOnly = true)
    public List<VoteDetailCommentResponse> getComments(Integer voteId, Integer userId) {

        List<VoteCommentEntity> roots =
                voteCommentRepository.findByVote_IdAndParentIsNull(voteId);

        return roots.stream()
                .map(root -> convertTreeNode(root, userId))
                .toList();
    }

    /* ================================
       🔥 댓글 좋아요/싫어요
       ================================ */
    public VoteDetailCommentResponse reactComment(Long commentId, Integer userId, boolean like) {

        VoteCommentEntity comment = voteCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        String likeKey = likeKey(commentId);
        String dislikeKey = dislikeKey(commentId);
        String likeUsers = likeUserKey(commentId);
        String dislikeUsers = dislikeUserKey(commentId);

        String userStr = userId.toString();

        boolean alreadyLike = Boolean.TRUE.equals(redis.opsForSet().isMember(likeUsers, userStr));
        boolean alreadyDislike = Boolean.TRUE.equals(redis.opsForSet().isMember(dislikeUsers, userStr));

        if (like) {
            // 👍 좋아요 토글
            if (alreadyLike) {
                redis.opsForSet().remove(likeUsers, userStr);
                redis.opsForValue().decrement(likeKey);
            } else {
                if (alreadyDislike) {
                    redis.opsForSet().remove(dislikeUsers, userStr);
                    redis.opsForValue().decrement(dislikeKey);
                }
                redis.opsForSet().add(likeUsers, userStr);
                redis.opsForValue().increment(likeKey);
            }
        } else {
            // 👎 싫어요 토글
            if (alreadyDislike) {
                redis.opsForSet().remove(dislikeUsers, userStr);
                redis.opsForValue().decrement(dislikeKey);
            } else {
                if (alreadyLike) {
                    redis.opsForSet().remove(likeUsers, userStr);
                    redis.opsForValue().decrement(likeKey);
                }
                redis.opsForSet().add(dislikeUsers, userStr);
                redis.opsForValue().increment(dislikeKey);
            }
        }

        // 방금 누른 기준으로 myLike/myDislike 포함해서 다시 내려줌
        return convertTreeNode(comment, userId);
    }

    /* ================================
       🔥 댓글 삭제 (Soft Delete)
       ================================ */
    public void deleteComment(Long commentId, Integer userId) {

        VoteCommentEntity comment = voteCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUser().getId().equals(userId)) {
            throw new RuntimeException("본인 댓글만 삭제 가능합니다.");
        }

        comment.softDelete();
    }

    /* ================================
       🔥 엔티티 → DTO 재귀 변환
       ================================ */

    // userId 없이 쓰는 경우용 (myLike/myDislike = false)
    private VoteDetailCommentResponse convertTreeNode(VoteCommentEntity c) {
        return convertTreeNode(c, null);
    }

    // userId 있으면 Redis에서 내가 누른 상태까지 반영
    private VoteDetailCommentResponse convertTreeNode(VoteCommentEntity c, Integer userId) {

        int like = getRedisInt(redis.opsForValue().get(likeKey(c.getCommentId())));
        int dislike = getRedisInt(redis.opsForValue().get(dislikeKey(c.getCommentId())));

        boolean myLike = false;
        boolean myDislike = false;

        if (userId != null) {
            String userStr = userId.toString();
            myLike = Boolean.TRUE.equals(redis.opsForSet().isMember(likeUserKey(c.getCommentId()), userStr));
            myDislike = Boolean.TRUE.equals(redis.opsForSet().isMember(dislikeUserKey(c.getCommentId()), userStr));
        }

        List<VoteDetailCommentResponse> children =
                c.getChildren() == null
                        ? List.of()
                        : c.getChildren().stream()
                              .map(child -> convertTreeNode(child, userId))
                              .toList();

        return VoteDetailCommentResponse.builder()
                .commentId(c.getCommentId().intValue())
                .voteId(c.getVote() != null ? c.getVote().getId() : null)
                .normalVoteId(null)   // 🔥 이제 NormalVote는 별도 엔티티로 분리됨

                .userId(c.getUser().getId())
                .username(c.getUser().getNickname())
                .content(Boolean.TRUE.equals(c.getIsDeleted()) ? "[삭제된 댓글입니다]" : c.getContent())
                .position(c.getPosition())
                .userPosition(c.getUserPosition())

                .likeCount(like)
                .dislikeCount(dislike)
                .myLike(myLike)
                .myDislike(myDislike)

                .linkedChoiceId(null)        // 필요 시 나중에 추가
                .linkedNormalChoiceId(null)  // 필요 시 나중에 추가

                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())

                .parentId(c.getParent() != null ? c.getParent().getCommentId().intValue() : null)
                .children(children)
                .build();
    }
}
