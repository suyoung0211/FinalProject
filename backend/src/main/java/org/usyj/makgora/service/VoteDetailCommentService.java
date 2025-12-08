package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.*;
import org.usyj.makgora.repository.*;
import org.usyj.makgora.response.voteDetails.VoteDetailCommentResponse;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class VoteDetailCommentService {

    private final VoteRepository voteRepository;
    private final NormalVoteRepository normalVoteRepository;
    private final UserRepository userRepository;
    private final VoteCommentRepository voteCommentRepository;

    private final StringRedisTemplate redis;

    /* =========================================================
       🔗 Redis Key Builder
       ========================================================= */
    private String likeKey(Long id) { return "VOTE_COMMENT:" + id + ":LIKE"; }
    private String dislikeKey(Long id) { return "VOTE_COMMENT:" + id + ":DISLIKE"; }
    private String likeUserKey(Long id) { return "VOTE_COMMENT_LIKED:" + id; }
    private String dislikeUserKey(Long id) { return "VOTE_COMMENT_DISLIKED:" + id; }
    private String countKey(Object id) { return "VOTE_COMMENT_COUNT:" + id; }


    /* =========================================================
       🔥 공통 댓글 생성 로직
       ========================================================= */
    private VoteCommentEntity createComment(
            VoteEntity aiVote,
            NormalVoteEntity normalVote,
            UserEntity user,
            VoteCommentEntity parent,
            String content,
            String position,
            String userPosition
    ) {

        VoteCommentEntity comment = VoteCommentEntity.builder()
                .vote(aiVote)
                .normalVote(normalVote)
                .issue(aiVote != null ? aiVote.getIssue() : null)
                .user(user)
                .content(content)
                .position(position)
                .userPosition(userPosition)
                .parent(parent)
                .likeCount(0)
                .dislikeCount(0)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        voteCommentRepository.save(comment);
        return comment;
    }


    /* =========================================================
       🔥 댓글 등록: AI Vote
       ========================================================= */
    public VoteDetailCommentResponse addCommentToVote(
            Integer voteId, Integer userId, String content,
            Integer parentId, String position, String userPosition,
            Long linkedChoiceId
    ) {
        VoteEntity vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("Vote not found"));

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        VoteCommentEntity parent = parentId != null
                ? voteCommentRepository.findById(parentId.longValue())
                    .orElseThrow(() -> new RuntimeException("Parent not found"))
                : null;

        // 부모가 NormalVote이면 오류
        if (parent != null && parent.getNormalVote() != null)
            throw new RuntimeException("AI 댓글에는 NormalVote 부모를 사용할 수 없습니다.");

        // 댓글 생성
        VoteCommentEntity comment =
                createComment(vote, null, user, parent, content, position, userPosition);

        // Redis 카운트 증가
        redis.opsForValue().increment(countKey(voteId));

        return convertTreeNode(comment);
    }


    /* =========================================================
       🔥 댓글 등록: NormalVote
       ========================================================= */
    public VoteDetailCommentResponse addCommentToNormalVote(
            Long normalVoteId, Integer userId, String content,
            Integer parentId, String position, String userPosition,
            Long linkedChoiceId
    ) {

        NormalVoteEntity vote = normalVoteRepository.findById(normalVoteId)
                .orElseThrow(() -> new RuntimeException("NormalVote not found"));

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        VoteCommentEntity parent = parentId != null
                ? voteCommentRepository.findById(parentId.longValue())
                    .orElseThrow(() -> new RuntimeException("Parent not found"))
                : null;

        // 댓글 생성
        VoteCommentEntity comment =
                createComment(null, vote, user, parent, content, position, userPosition);

        // Redis 카운트 증가
        redis.opsForValue().increment(countKey(normalVoteId));

        return convertTreeNode(comment);
    }


    /* =========================================================
       🔥 댓글 좋아요/싫어요 (AI + Normal 공용)
       ========================================================= */
    public VoteDetailCommentResponse reactComment(Long commentId, Integer userId, boolean like) {

        VoteCommentEntity comment = voteCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        String likeKey = likeKey(commentId);
        String dislikeKey = dislikeKey(commentId);

        String likeUsers = likeUserKey(commentId);
        String dislikeUsers = dislikeUserKey(commentId);

        String userStr = userId.toString();

        if (like) {
            if (Boolean.TRUE.equals(redis.opsForSet().isMember(likeUsers, userStr))) {
                redis.opsForSet().remove(likeUsers, userStr);
                redis.opsForValue().decrement(likeKey);
            } else {
                if (Boolean.TRUE.equals(redis.opsForSet().isMember(dislikeUsers, userStr))) {
                    redis.opsForSet().remove(dislikeUsers, userStr);
                    redis.opsForValue().decrement(dislikeKey);
                }
                redis.opsForSet().add(likeUsers, userStr);
                redis.opsForValue().increment(likeKey);
            }
        } else {
            if (Boolean.TRUE.equals(redis.opsForSet().isMember(dislikeUsers, userStr))) {
                redis.opsForSet().remove(dislikeUsers, userStr);
                redis.opsForValue().decrement(dislikeKey);
            } else {
                if (Boolean.TRUE.equals(redis.opsForSet().isMember(likeUsers, userStr))) {
                    redis.opsForSet().remove(likeUsers, userStr);
                    redis.opsForValue().decrement(likeKey);
                }
                redis.opsForSet().add(dislikeUsers, userStr);
                redis.opsForValue().increment(dislikeKey);
            }
        }

        return convertTreeNode(comment);
    }


    /* =========================================================
       🔥 댓글 조회 (AI → 없으면 Normal)
       ========================================================= */
    public List<VoteDetailCommentResponse> getComments(Integer voteId) {

        List<VoteCommentEntity> aiRoots =
                voteCommentRepository.findByVote_IdAndParentIsNull(voteId);

        if (!aiRoots.isEmpty())
            return aiRoots.stream().map(this::convertTreeNode).toList();

        List<VoteCommentEntity> normalRoots =
                voteCommentRepository.findByNormalVote_IdAndParentIsNull(Long.valueOf(voteId));

        return normalRoots.stream().map(this::convertTreeNode).toList();
    }


    /* =========================================================
       🔥 댓글 삭제 (Soft Delete)
       ========================================================= */
    public void deleteComment(Long commentId, Integer userId) {

        VoteCommentEntity comment = voteCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUser().getId().equals(userId))
            throw new RuntimeException("본인 댓글만 삭제 가능합니다.");

        comment.softDelete();
    }


    /* =========================================================
       🔥 트리 변환 + Redis 좋아요 반영
       ========================================================= */
    private VoteDetailCommentResponse convertTreeNode(VoteCommentEntity c) {

        int like = getRedisInt(redis.opsForValue().get(likeKey(c.getCommentId())));
        int dislike = getRedisInt(redis.opsForValue().get(dislikeKey(c.getCommentId())));

        return VoteDetailCommentResponse.builder()
                .commentId(c.getCommentId().intValue())
                .voteId(c.getVote() != null ? c.getVote().getId() : null)
                .normalVoteId(
                        c.getNormalVote() != null ? c.getNormalVote().getId().intValue() : null
                )
                .userId(c.getUser().getId())
                .username(c.getUser().getNickname())
                .content(c.getDeleted() ? "[삭제된 댓글입니다]" : c.getContent())
                .position(c.getPosition())
                .userPosition(c.getUserPosition())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .parentId(c.getParent() != null ? c.getParent().getCommentId().intValue() : null)
                .likeCount(like)
                .dislikeCount(dislike)
                .children(
                        c.getChildren().stream()
                                .map(this::convertTreeNode)
                                .toList()
                )
                .build();
    }


    private int getRedisInt(String v) {
        if (v == null) return 0;
        try { return Integer.parseInt(v); }
        catch (Exception e) { return 0; }
    }
}
