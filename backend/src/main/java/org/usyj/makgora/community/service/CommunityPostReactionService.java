package org.usyj.makgora.community.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.community.dto.CommunityPostReactionResponse;
import org.usyj.makgora.community.repository.CommunityPostReactionRepository;
import org.usyj.makgora.community.repository.CommunityPostRepository;
import org.usyj.makgora.entity.CommunityPostEntity;
import org.usyj.makgora.entity.CommunityPostReactionEntity;
import org.usyj.makgora.entity.UserEntity;

@Service
@RequiredArgsConstructor
public class CommunityPostReactionService {

    private final CommunityPostRepository postRepository;
    private final CommunityPostReactionRepository reactionRepository;

    private final StringRedisTemplate redis;
    private static final String PREFIX = "cp:";

    /* ============================================
       📌 조회수 증가 (Redis + DB 동시 반영)
     ============================================ */
    public void addView(Long postId) {

        // Redis 증가
        redis.opsForValue().increment(PREFIX + postId + ":view");

        // DB 증가
        CommunityPostEntity post = postRepository.findById(postId).orElse(null);
        if (post != null) {
            post.setViewCount(post.getViewCount() + 1);
            postRepository.save(post);
        }
    }

    /* ============================================
       📌 댓글수 증가 (Redis + DB 동시 반영)
     ============================================ */
    public void addComment(Long postId) {

        // Redis 증가
        redis.opsForValue().increment(PREFIX + postId + ":comment");

        // DB 증가
        CommunityPostEntity post = postRepository.findById(postId).orElse(null);
        if (post != null) {
            post.setCommentCount(post.getCommentCount() + 1);
            postRepository.save(post);
        }
    }

    /* ============================================
       📌 추천/비추천 (Redis + DB 동시 반영)
     ============================================ */
    @Transactional
public CommunityPostReactionResponse reactToPost(Long postId, UserEntity user, Integer newValue) {

    CommunityPostEntity post = postRepository.findById(postId)
            .orElseThrow(() -> new IllegalArgumentException("게시글이 존재하지 않음 id=" + postId));

    // 기존 반응 조회
    CommunityPostReactionEntity existing = reactionRepository
            .findByPostAndUser(post, user)
            .orElse(null);

    int oldValue = existing != null ? existing.getReactionValue() : 0;

    // ⚠ 동일값이면 아무 것도 업데이트 하지 않음
    if (oldValue == newValue) {
        return createResponse(postId, oldValue);
    }

    // ---------------------------------------------------------
    // 1) DB 업데이트
    // ---------------------------------------------------------
    if (oldValue == 1) post.setRecommendationCount(Math.max(0, post.getRecommendationCount() - 1));
    if (oldValue == -1) post.setDislikeCount(Math.max(0, post.getDislikeCount() - 1));

    if (newValue == 1) post.setRecommendationCount(post.getRecommendationCount() + 1);
    if (newValue == -1) post.setDislikeCount(post.getDislikeCount() + 1);

    postRepository.save(post);

    // ---------------------------------------------------------
    // 2) Redis 를 DB 값으로 강제 sync
    // ---------------------------------------------------------
    redis.opsForValue().set(PREFIX + postId + ":like", String.valueOf(post.getRecommendationCount()));
    redis.opsForValue().set(PREFIX + postId + ":dislike", String.valueOf(post.getDislikeCount()));

    // ---------------------------------------------------------
    // 3) 반응 엔티티 CRUD 처리
    // ---------------------------------------------------------
    if (newValue == 0) {
        if (existing != null) reactionRepository.delete(existing);
    } else {
        if (existing == null) {
            reactionRepository.save(
                    CommunityPostReactionEntity.builder()
                            .post(post)
                            .user(user)
                            .reactionValue(newValue)
                            .build()
            );
        } else {
            existing.setReactionValue(newValue);
        }
    }

    return new CommunityPostReactionResponse(
            post.getPostId(),
            post.getRecommendationCount(),
            post.getDislikeCount(),
            newValue
    );
}

    /* ============================================
       📌 Redis 값 기반 응답 생성
     ============================================ */
    private CommunityPostReactionResponse createResponse(Long postId, int reactionValue) {

        int like = (int) getRedisCount(postId, "like");
        int dislike = (int) getRedisCount(postId, "dislike");

        return new CommunityPostReactionResponse(
                postId,
                like,
                dislike,
                reactionValue
        );
    }

    /* ============================================
       📌 Redis 값 읽기 helper
     ============================================ */
    private long getRedisCount(Long postId, String type) {
        String v = redis.opsForValue().get(PREFIX + postId + ":" + type);
        return (v == null) ? 0 : Long.parseLong(v);
    }
}
