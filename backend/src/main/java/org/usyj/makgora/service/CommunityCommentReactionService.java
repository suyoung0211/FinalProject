package org.usyj.makgora.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.community.repository.CommunityCommentRepository;
import org.usyj.makgora.entity.CommunityCommentEntity;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
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
        return "cc:" + id + ":like";
    }

    private String dislikeCountKey(Long id) {
        return "cc:" + id + ":dislike";
    }

    /** 댓글 추천 (Like) */
    @Transactional
    public String like(Long commentId, Long userId) {

        CommunityCommentEntity comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));

        String likeSet = likeSetKey(commentId);
        String dislikeSet = dislikeSetKey(commentId);

        boolean alreadyLiked =
                Boolean.TRUE.equals(redis.opsForSet().isMember(likeSet, userId.toString()));

        if (alreadyLiked) {
            // 좋아요 취소
            int currentLikeCount = (comment.getLikeCount() != null) ? comment.getLikeCount() : 0;
            comment.setLikeCount(Math.max(0, currentLikeCount - 1));
            commentRepo.save(comment);

            redis.opsForSet().remove(likeSet, userId.toString());
            redis.opsForValue().set(likeCountKey(commentId), String.valueOf(comment.getLikeCount()));

            return "like_removed";
        }

        // 싫어요를 눌렀던 상태면 취소
        boolean alreadyDisliked =
                Boolean.TRUE.equals(redis.opsForSet().isMember(dislikeSet, userId.toString()));

        if (alreadyDisliked) {
            int currentDislikeCount = (comment.getDislikeCount() != null) ? comment.getDislikeCount() : 0;
            comment.setDislikeCount(Math.max(0, currentDislikeCount - 1));
            commentRepo.save(comment);

            redis.opsForSet().remove(dislikeSet, userId.toString());
            redis.opsForValue().set(dislikeCountKey(commentId), String.valueOf(comment.getDislikeCount()));
        }

        // 좋아요 추가
        int currentLikeCount = (comment.getLikeCount() != null) ? comment.getLikeCount() : 0;
        comment.setLikeCount(currentLikeCount + 1);
        commentRepo.save(comment);

        redis.opsForSet().add(likeSet, userId.toString());
        redis.opsForValue().set(likeCountKey(commentId), String.valueOf(comment.getLikeCount()));

        return "like_added";
    }

    /** 댓글 비추천 (Dislike) */
    @Transactional
    public String dislike(Long commentId, Long userId) {

        CommunityCommentEntity comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));

        String likeSet = likeSetKey(commentId);
        String dislikeSet = dislikeSetKey(commentId);

        boolean alreadyDisliked =
                Boolean.TRUE.equals(redis.opsForSet().isMember(dislikeSet, userId.toString()));

        if (alreadyDisliked) {
            // 비추천 취소
            int currentDislikeCount = (comment.getDislikeCount() != null) ? comment.getDislikeCount() : 0;
            comment.setDislikeCount(Math.max(0, currentDislikeCount - 1));
            commentRepo.save(comment);

            redis.opsForSet().remove(dislikeSet, userId.toString());
            redis.opsForValue().set(dislikeCountKey(commentId), String.valueOf(comment.getDislikeCount()));

            return "dislike_removed";
        }

        // 좋아요를 눌렀던 상태면 취소
        boolean alreadyLiked =
                Boolean.TRUE.equals(redis.opsForSet().isMember(likeSet, userId.toString()));

        if (alreadyLiked) {
            int currentLikeCount = (comment.getLikeCount() != null) ? comment.getLikeCount() : 0;
            comment.setLikeCount(Math.max(0, currentLikeCount - 1));
            commentRepo.save(comment);

            redis.opsForSet().remove(likeSet, userId.toString());
            redis.opsForValue().set(likeCountKey(commentId), String.valueOf(comment.getLikeCount()));
        }

        // 비추천 추가
        int currentDislikeCount = (comment.getDislikeCount() != null) ? comment.getDislikeCount() : 0;
        comment.setDislikeCount(currentDislikeCount + 1);
        commentRepo.save(comment);

        redis.opsForSet().add(dislikeSet, userId.toString());
        redis.opsForValue().set(dislikeCountKey(commentId), String.valueOf(comment.getDislikeCount()));

        return "dislike_added";
    }
}

