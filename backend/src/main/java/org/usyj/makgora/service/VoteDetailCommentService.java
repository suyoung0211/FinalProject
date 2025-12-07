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
       🔥 Redis Key Builder
       ========================================================= */
    private String likeKey(Long commentId) { return "VOTE_COMMENT:" + commentId + ":LIKE"; }
    private String dislikeKey(Long commentId) { return "VOTE_COMMENT:" + commentId + ":DISLIKE"; }
    private String likeUserSet(Long commentId) { return "VOTE_COMMENT_LIKED:" + commentId; }
    private String dislikeUserSet(Long commentId) { return "VOTE_COMMENT_DISLIKED:" + commentId; }
    private String commentCountKey(Long voteId) { return "VOTE_COMMENT_COUNT:" + voteId; }


    /* =========================================================
       🔥 1) AI Vote 댓글 작성
       ========================================================= */
    public VoteDetailCommentResponse addCommentToVote(
            Integer voteId,
            Integer userId,
            String content,
            Integer parentCommentId,
            String position,
            String userPosition,
            Long linkedChoiceId
    ) {
        VoteEntity vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("Vote not found"));

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        VoteCommentEntity parent = null;
        if (parentCommentId != null) {
            parent = voteCommentRepository.findById(parentCommentId.longValue())
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
        }

        VoteCommentEntity comment = VoteCommentEntity.builder()
                .vote(vote)
                .normalVote(null)
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

        // Redis 댓글 수 증가
        redis.opsForValue().increment(commentCountKey(vote.getId().longValue()));

        return convertRedisDto(comment);
    }

    /* =========================================================
   🔥 공용 댓글 조회 (AI Vote + Normal Vote 자동 판단)
   ========================================================= */
public List<VoteDetailCommentResponse> getComments(Integer voteId) {

    // AI Vote인지 확인
    boolean isAiVote = voteRepository.existsById(voteId);

    if (isAiVote) {
        List<VoteCommentEntity> roots =
                voteCommentRepository.findByVote_IdAndParentIsNull(voteId);

        return roots.stream()
                .map(this::convertTreeDto)
                .toList();
    }

    // NormalVote로 처리
    List<VoteCommentEntity> roots =
            voteCommentRepository.findByNormalVote_IdAndParentIsNull(Long.valueOf(voteId));

    return roots.stream()
            .map(this::convertTreeDto)
            .toList();
}

    /* =========================================================
       🔥 2) Normal Vote 댓글 작성
       ========================================================= */
    public VoteDetailCommentResponse addCommentToNormalVote(
            Long normalVoteId,
            Integer userId,
            String content,
            Integer parentCommentId,
            String position,
            String userPosition,
            Long linkedChoiceId
    ) {
        NormalVoteEntity vote = normalVoteRepository.findById(normalVoteId)
                .orElseThrow(() -> new RuntimeException("NormalVote not found"));

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        VoteCommentEntity parent = null;
        if (parentCommentId != null) {
            parent = voteCommentRepository.findById(parentCommentId.longValue())
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
        }

        VoteCommentEntity comment = VoteCommentEntity.builder()
                .vote(null)
                .normalVote(vote)
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

        return convertRedisDto(comment);
    }



    /* =========================================================
       🔥 3) 댓글 좋아요/싫어요 (AI + NormalVote 공용)
       ========================================================= */
    public VoteDetailCommentResponse reactComment(Long commentId, Integer userId, boolean like) {

        VoteCommentEntity comment = voteCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        String likeKey = likeKey(commentId);
        String dislikeKey = dislikeKey(commentId);
        String likeSet = likeUserSet(commentId);
        String dislikeSet = dislikeUserSet(commentId);

        /* ----- 좋아요 ----- */
        if (like) {
            if (Boolean.TRUE.equals(redis.opsForSet().isMember(likeSet, userId.toString()))) {
                redis.opsForSet().remove(likeSet, userId.toString());
                redis.opsForValue().decrement(likeKey);
            } else {
                if (Boolean.TRUE.equals(redis.opsForSet().isMember(dislikeSet, userId.toString()))) {
                    redis.opsForSet().remove(dislikeSet, userId.toString());
                    redis.opsForValue().decrement(dislikeKey);
                }
                redis.opsForSet().add(likeSet, userId.toString());
                redis.opsForValue().increment(likeKey);
            }
        }
        /* ----- 싫어요 ----- */
        else {
            if (Boolean.TRUE.equals(redis.opsForSet().isMember(dislikeSet, userId.toString()))) {
                redis.opsForSet().remove(dislikeSet, userId.toString());
                redis.opsForValue().decrement(dislikeKey);
            } else {
                if (Boolean.TRUE.equals(redis.opsForSet().isMember(likeSet, userId.toString()))) {
                    redis.opsForSet().remove(likeSet, userId.toString());
                    redis.opsForValue().decrement(likeKey);
                }
                redis.opsForSet().add(dislikeSet, userId.toString());
                redis.opsForValue().increment(dislikeKey);
            }
        }

        return convertRedisDto(comment);
    }



    /* =========================================================
       🔥 4) 댓글 삭제
       ========================================================= */
    public void deleteComment(Long commentId, Integer userId) {

        VoteCommentEntity comment = voteCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUser().getId().equals(userId)) {
            throw new RuntimeException("본인 댓글만 삭제 가능합니다.");
        }

        voteCommentRepository.delete(comment);
    }



    /* =========================================================
       🔥 5) 댓글 조회 (AI Vote / Normal Vote 자동 판단)
       ========================================================= */
    public List<VoteDetailCommentResponse> getCommentsForNormalVote(Long voteId) {

        List<VoteCommentEntity> roots =
                voteCommentRepository.findByNormalVote_IdAndParentIsNull(voteId);

        return roots.stream()
                .map(this::convertTreeDto)
                .toList();
    }




    /* =========================================================
       🔥 Util: 단건 + Redis 값 포함 DTO 변환
       ========================================================= */
    private VoteDetailCommentResponse convertRedisDto(VoteCommentEntity c) {

        int likeCount = getInt(redis.opsForValue().get(likeKey(c.getCommentId())));
        int dislikeCount = getInt(redis.opsForValue().get(dislikeKey(c.getCommentId())));

        return VoteDetailCommentResponse.builder()
                .commentId(c.getCommentId().intValue())
                .voteId(c.getVote() != null ? c.getVote().getId() : null)
                .normalVoteId(c.getNormalVote() != null ? c.getNormalVote().getId().intValue() : null)
                .userId(c.getUser().getId())
                .username(c.getUser().getNickname())
                .content(c.getContent())
                .position(c.getPosition())
                .userPosition(c.getUserPosition())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .parentId(c.getParent() != null ? c.getParent().getCommentId().intValue() : null)
                .children(List.of())
                .likeCount(likeCount)
                .dislikeCount(dislikeCount)
                .build();
    }



    /* =========================================================
       🔥 트리 형태 변환 (NormalVoteResponse에서 사용)
       ========================================================= */
    public VoteDetailCommentResponse convertTreeDto(VoteCommentEntity c) {
        return VoteDetailCommentResponse.builder()
                .commentId(c.getCommentId().intValue())
                .voteId(null)
                .normalVoteId(c.getNormalVote().getId().intValue())
                .userId(c.getUser().getId())
                .username(c.getUser().getNickname())
                .content(c.getContent())
                .position(c.getPosition())
                .userPosition(c.getUserPosition())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .parentId(c.getParent() != null ? c.getParent().getCommentId().intValue() : null)
                .likeCount(c.getLikeCount())
                .dislikeCount(c.getDislikeCount())
                .children(
                        c.getChildren().stream()
                                .map(this::convertTreeDto)
                                .toList()
                )
                .build();
    }


    private int getInt(String value) {
        if (value == null) return 0;
        try { return Integer.parseInt(value); }
        catch (Exception e) { return 0; }
    }
}
