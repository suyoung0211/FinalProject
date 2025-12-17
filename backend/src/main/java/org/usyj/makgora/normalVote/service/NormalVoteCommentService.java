package org.usyj.makgora.normalVote.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.normalVote.entity.NormalVoteCommentEntity;
import org.usyj.makgora.normalVote.entity.NormalVoteEntity;
import org.usyj.makgora.normalVote.repository.NormalVoteCommentRepository;
import org.usyj.makgora.normalVote.repository.NormalVoteRepository;
import org.usyj.makgora.user.entity.UserEntity;
import org.usyj.makgora.user.repository.UserRepository;
import org.usyj.makgora.vote.dto.voteDetailResponse.VoteDetailCommentResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional
public class NormalVoteCommentService {

    private final NormalVoteCommentRepository commentRepository;
    private final NormalVoteRepository normalVoteRepository;
    private final UserRepository userRepository;

    private final StringRedisTemplate redis;


    /* =========================================================
       🔵 1) 댓글 조회 (루트 댓글들만 + 트리 변환)
       ========================================================= */
    @Transactional(readOnly = true)
    public List<VoteDetailCommentResponse> getComments(Integer normalVoteId, Integer userId) {

        List<NormalVoteCommentEntity> roots =
                commentRepository.findByNormalVote_IdAndParentIsNull(normalVoteId);

        return roots.stream()
                .map(root -> convertComment(root, userId))
                .toList();
    }

    /* =========================================================
       🔵 2) 댓글 등록
       ========================================================= */
    public VoteDetailCommentResponse addComment(
            Integer normalVoteId,
            Integer userId,
            String content,
            Long parentId
    ) {

        NormalVoteEntity normalVote = normalVoteRepository.findById(normalVoteId)
                .orElseThrow(() -> new RuntimeException("NormalVote 없음"));

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User 없음"));

        NormalVoteCommentEntity parent = null;
        if (parentId != null) {
            parent = commentRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("부모 댓글 없음"));
        }

        NormalVoteCommentEntity comment = NormalVoteCommentEntity.builder()
                .normalVote(normalVote)
                .user(user)
                .content(content)
                .parent(parent)
                .likeCount(0)
                .dislikeCount(0)
                .isDeleted(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        commentRepository.save(comment);

        return convertComment(comment, userId);
    }

    private void ensureKey(String key) {
    if (redis.opsForValue().get(key) == null) {
        redis.opsForValue().set(key, "0");
    }
}

private void safeDecrement(String key) {
    String v = redis.opsForValue().get(key);
    long cur = (v == null) ? 0 : Long.parseLong(v);
    if (cur > 0) redis.opsForValue().increment(key, -1);
    else redis.opsForValue().set(key, "0");
}

    /* =========================================================
       🔵 3) 댓글 좋아요 / 싫어요 (Redis 기반)
       ========================================================= */
    public VoteDetailCommentResponse react(Long commentId, Integer userId, boolean like) {

    NormalVoteCommentEntity comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("댓글 없음"));

    String keyLike = "normalvote:comment:" + commentId + ":likes";
    String keyDislike = "normalvote:comment:" + commentId + ":dislikes";
    String setLike = "normalvote:comment:" + commentId + ":likes:users";
    String setDislike = "normalvote:comment:" + commentId + ":dislikes:users";

    String userStr = userId.toString();

    // 🔐 key 초기화 (없으면 0)
    ensureKey(keyLike);
    ensureKey(keyDislike);

    boolean alreadyLike =
            Boolean.TRUE.equals(redis.opsForSet().isMember(setLike, userStr));
    boolean alreadyDislike =
            Boolean.TRUE.equals(redis.opsForSet().isMember(setDislike, userStr));

    if (like) {
        if (alreadyLike) {
            // 👍 → 취소
            redis.opsForSet().remove(setLike, userStr);
            safeDecrement(keyLike);
        } else {
            // 👎 → 👍 전환
            if (alreadyDislike) {
                redis.opsForSet().remove(setDislike, userStr);
                safeDecrement(keyDislike);
            }
            redis.opsForSet().add(setLike, userStr);
            redis.opsForValue().increment(keyLike);
        }
    } else {
        if (alreadyDislike) {
            // 👎 → 취소
            redis.opsForSet().remove(setDislike, userStr);
            safeDecrement(keyDislike);
        } else {
            // 👍 → 👎 전환
            if (alreadyLike) {
                redis.opsForSet().remove(setLike, userStr);
                safeDecrement(keyLike);
            }
            redis.opsForSet().add(setDislike, userStr);
            redis.opsForValue().increment(keyDislike);
        }
    }

    return convertComment(comment, userId);
}

    /* =========================================================
       🔵 4) 댓글 삭제 (Soft Delete)
       ========================================================= */
    public void deleteComment(Long commentId, Integer userId) {

        NormalVoteCommentEntity c = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글 없음"));

        if (!Objects.equals(c.getUser().getId(), userId))
            throw new RuntimeException("댓글 삭제 권한 없음");

        c.setIsDeleted(true);   // setDeleted() 아님!!
        c.setContent("(삭제된 댓글입니다.)");
        c.setUpdatedAt(LocalDateTime.now());

        commentRepository.save(c);
    }

    

    /* =========================================================
       🔵 5) 엔티티 → DTO 변환 (재귀)
       ========================================================= */
    private VoteDetailCommentResponse convertComment(
        NormalVoteCommentEntity c,
        Integer userId
) {
    String keyLike = "normalvote:comment:" + c.getId() + ":likes";
    String keyDislike = "normalvote:comment:" + c.getId() + ":dislikes";
    String setLike = "normalvote:comment:" + c.getId() + ":likes:users";
    String setDislike = "normalvote:comment:" + c.getId() + ":dislikes:users";

    String likeStr = redis.opsForValue().get(keyLike);
    String dislikeStr = redis.opsForValue().get(keyDislike);

    long likeCount = (likeStr == null) ? 0L : Long.parseLong(likeStr);
    long dislikeCount = (dislikeStr == null) ? 0L : Long.parseLong(dislikeStr);

    boolean myLike = userId != null &&
            Boolean.TRUE.equals(
                    redis.opsForSet().isMember(setLike, userId.toString())
            );

    boolean myDislike = userId != null &&
            Boolean.TRUE.equals(
                    redis.opsForSet().isMember(setDislike, userId.toString())
            );

    List<VoteDetailCommentResponse> children =
            c.getChildren() == null
                    ? List.of()
                    : c.getChildren().stream()
                      .map(child -> convertComment(child, userId))
                      .toList();

    return VoteDetailCommentResponse.builder()
            .commentId(c.getId().intValue())
            .normalVoteId(c.getNormalVote().getId().intValue())
            .userId(c.getUser().getId())
            .username(c.getUser().getNickname())
            .content(Boolean.TRUE.equals(c.getIsDeleted())
                    ? "(삭제된 댓글입니다.)"
                    : c.getContent())
            .likeCount((int) likeCount)
            .dislikeCount((int) dislikeCount)
            .myLike(myLike)
            .myDislike(myDislike)
            .parentId(
                    c.getParent() != null
                            ? c.getParent().getId().intValue()
                            : null
            )
            .children(children)
            .createdAt(c.getCreatedAt())
            .updatedAt(c.getUpdatedAt())
            .build();
}

/* =========================================================
   🔵 6) 댓글 수정
   ========================================================= */
public VoteDetailCommentResponse updateComment(Long commentId, Integer userId, String newContent) {

    NormalVoteCommentEntity comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("댓글 없음"));

    if (!Objects.equals(comment.getUser().getId(), userId)) {
        throw new RuntimeException("댓글 수정 권한 없음");
    }

    if (Boolean.TRUE.equals(comment.getIsDeleted())) {
        throw new RuntimeException("삭제된 댓글은 수정할 수 없습니다.");
    }

    comment.setContent(newContent);
    comment.setUpdatedAt(LocalDateTime.now());

    commentRepository.save(comment);

    return convertComment(comment, userId);
}

}
