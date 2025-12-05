package org.usyj.makgora.community.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.community.repository.CommunityCommentRepository;
import org.usyj.makgora.entity.CommunityCommentEntity;
import org.usyj.makgora.community.dto.CommunityCommentReactionResponse;

@Service
@RequiredArgsConstructor
@Transactional
public class CommunityCommentReactionService {

    private final StringRedisTemplate redis;
    private final CommunityCommentRepository commentRepo;

    private String likeSetKey(Long id) {
        return "community:comment:" + id + ":like:users";
    }

    private String dislikeSetKey(Long id) {
        return "community:comment:" + id + ":dislike:users";
    }

    private String likeCountKey(Long id) {
        return "community:comment:" + id + ":like:count";
    }

    private String dislikeCountKey(Long id) {
        return "community:comment:" + id + ":dislike:count";
    }

    /** 👍 댓글 좋아요 */
    public CommunityCommentReactionResponse like(Long commentId, Long userId) {

        CommunityCommentEntity comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));

        String likeSet = likeSetKey(commentId);
        String dislikeSet = dislikeSetKey(commentId);

        boolean alreadyLiked =
                Boolean.TRUE.equals(redis.opsForSet().isMember(likeSet, userId.toString()));

        if (alreadyLiked) {
            comment.setLikeCount(comment.getLikeCount() - 1);
            commentRepo.save(comment);

            redis.opsForSet().remove(likeSet, userId.toString());
        } else {

            comment.setLikeCount(comment.getLikeCount() + 1);
            commentRepo.save(comment);

            redis.opsForSet().add(likeSet, userId.toString());

            // 기존 비추천 취소
            boolean alreadyDisliked =
                    Boolean.TRUE.equals(redis.opsForSet().isMember(dislikeSet, userId.toString()));
            if (alreadyDisliked) {
                comment.setDislikeCount(comment.getDislikeCount() - 1);
                commentRepo.save(comment);
                redis.opsForSet().remove(dislikeSet, userId.toString());
            }
        }

        long likeCnt = redis.opsForSet().size(likeSet);
        long dislikeCnt = redis.opsForSet().size(dislikeSet);

        redis.opsForValue().set(likeCountKey(commentId), String.valueOf(likeCnt));
        redis.opsForValue().set(dislikeCountKey(commentId), String.valueOf(dislikeCnt));

        boolean likedByMe = redis.opsForSet().isMember(likeSet, userId.toString());
        boolean dislikedByMe = redis.opsForSet().isMember(dislikeSet, userId.toString());

        return CommunityCommentReactionResponse.builder()
                .commentId(commentId)
                .likeCount(likeCnt)
                .dislikeCount(dislikeCnt)
                .likedByMe(likedByMe)
                .dislikedByMe(dislikedByMe)
                .build();
    }

    /** 👎 댓글 비추천 */
    public CommunityCommentReactionResponse dislike(Long commentId, Long userId) {

        CommunityCommentEntity comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));

        String likeSet = likeSetKey(commentId);
        String dislikeSet = dislikeSetKey(commentId);

        boolean alreadyDisliked =
                Boolean.TRUE.equals(redis.opsForSet().isMember(dislikeSet, userId.toString()));

        if (alreadyDisliked) {
            comment.setDislikeCount(comment.getDislikeCount() - 1);
            commentRepo.save(comment);

            redis.opsForSet().remove(dislikeSet, userId.toString());
        } else {

            comment.setDislikeCount(comment.getDislikeCount() + 1);
            commentRepo.save(comment);

            redis.opsForSet().add(dislikeSet, userId.toString());

            boolean alreadyLiked =
                    Boolean.TRUE.equals(redis.opsForSet().isMember(likeSet, userId.toString()));
            if (alreadyLiked) {
                comment.setLikeCount(comment.getLikeCount() - 1);
                commentRepo.save(comment);
                redis.opsForSet().remove(likeSet, userId.toString());
            }
        }

        long likeCnt = redis.opsForSet().size(likeSet);
        long dislikeCnt = redis.opsForSet().size(dislikeSet);

        redis.opsForValue().set(likeCountKey(commentId), String.valueOf(likeCnt));
        redis.opsForValue().set(dislikeCountKey(commentId), String.valueOf(dislikeCnt));

        boolean likedByMe = redis.opsForSet().isMember(likeSet, userId.toString());
        boolean dislikedByMe = redis.opsForSet().isMember(dislikeSet, userId.toString());

        return CommunityCommentReactionResponse.builder()
                .commentId(commentId)
                .likeCount(likeCnt)
                .dislikeCount(dislikeCnt)
                .likedByMe(likedByMe)
                .dislikedByMe(dislikedByMe)
                .build();
    }

    /** 댓글 삭제 시 Redis 초기화 */
    public void clearCommentReaction(Long commentId) {
        redis.delete(likeSetKey(commentId));
        redis.delete(dislikeSetKey(commentId));
        redis.delete(likeCountKey(commentId));
        redis.delete(dislikeCountKey(commentId));
    }
}
