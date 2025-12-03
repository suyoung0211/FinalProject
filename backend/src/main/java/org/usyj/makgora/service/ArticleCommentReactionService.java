package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.ArticleCommentEntity;
import org.usyj.makgora.repository.ArticleCommentRepository;

@Service
@RequiredArgsConstructor
public class ArticleCommentReactionService {

    private final StringRedisTemplate redis;
    private final ArticleCommentRepository commentRepo;

    private String likeSetKey(Long id) {
        return "article:comment:" + id + ":like:users";
    }

    private String dislikeSetKey(Long id) {
        return "article:comment:" + id + ":dislike:users";
    }

    private String likeCountKey(Long id) {
        return "article:comment:" + id + ":like:count";
    }

    private String dislikeCountKey(Long id) {
        return "article:comment:" + id + ":dislike:count";
    }

    /** 댓글 좋아요 */
    @Transactional
    public String like(Long commentId, Long userId) {

        ArticleCommentEntity comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));

        String likeSet = likeSetKey(commentId);
        String dislikeSet = dislikeSetKey(commentId);

        boolean alreadyLiked =
                Boolean.TRUE.equals(redis.opsForSet().isMember(likeSet, userId.toString()));

        if (alreadyLiked) {
            // 좋아요 취소
            comment.setLikeCount(comment.getLikeCount() - 1);
            commentRepo.save(comment);

            redis.opsForSet().remove(likeSet, userId.toString());
            redis.opsForValue().set(likeCountKey(commentId),
                    String.valueOf(comment.getLikeCount()));

            return "like_removed";
        }

        // 싫어요 눌렀던 상태면 제거 (음수 방지)
        boolean alreadyDisliked =
                Boolean.TRUE.equals(redis.opsForSet().isMember(dislikeSet, userId.toString()));

        if (alreadyDisliked) {
            comment.setDislikeCount(Math.max(0, comment.getDislikeCount() - 1));
            commentRepo.save(comment);

            redis.opsForSet().remove(dislikeSet, userId.toString());
            redis.opsForValue().set(dislikeCountKey(commentId),
                    String.valueOf(comment.getDislikeCount()));
        }

        // 좋아요 추가
        comment.setLikeCount(comment.getLikeCount() + 1);
        commentRepo.save(comment);

        redis.opsForSet().add(likeSet, userId.toString());
        redis.opsForValue().set(likeCountKey(commentId),
                String.valueOf(comment.getLikeCount()));

        return "like_added";
    }

    /** 댓글 싫어요 */
    @Transactional
    public String dislike(Long commentId, Long userId) {

        ArticleCommentEntity comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));

        String likeSet = likeSetKey(commentId);
        String dislikeSet = dislikeSetKey(commentId);

        boolean alreadyDisliked =
                Boolean.TRUE.equals(redis.opsForSet().isMember(dislikeSet, userId.toString()));

        if (alreadyDisliked) {
            // 싫어요 취소
            comment.setDislikeCount(comment.getDislikeCount() - 1);
            commentRepo.save(comment);

            redis.opsForSet().remove(dislikeSet, userId.toString());
            redis.opsForValue().set(dislikeCountKey(commentId),
                    String.valueOf(comment.getDislikeCount()));

            return "dislike_removed";
        }

         // 좋아요 눌렀던 상태면 제거 (음수 방지)
        boolean alreadyLiked =
                Boolean.TRUE.equals(redis.opsForSet().isMember(likeSet, userId.toString()));

        if (alreadyLiked) {
            comment.setLikeCount(Math.max(0, comment.getLikeCount() - 1));
            commentRepo.save(comment);

            redis.opsForSet().remove(likeSet, userId.toString());
            redis.opsForValue().set(likeCountKey(commentId),
                    String.valueOf(comment.getLikeCount()));
        }

        // 싫어요 추가
        comment.setDislikeCount(comment.getDislikeCount() + 1);
        commentRepo.save(comment);

        redis.opsForSet().add(dislikeSet, userId.toString());
        redis.opsForValue().set(dislikeCountKey(commentId),
                String.valueOf(comment.getDislikeCount()));

        return "dislike_added";
    }
}
