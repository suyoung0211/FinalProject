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

    /* ========================== 키 생성 =========================== */

    private String key(Long postId, String type) {
        return PREFIX + postId + ":" + type;  // ex) cp:10:like
    }

    private long getCount(Long postId, String type) {
        String v = redis.opsForValue().get(key(postId, type));
        return (v == null) ? 0L : Long.parseLong(v);
    }

    /* ========================== Safe Decrement ==================== */

    private void safeDecrement(String redisKey) {
        String v = redis.opsForValue().get(redisKey);
        long current = (v == null) ? 0L : Long.parseLong(v);

        if (current > 0) {
            redis.opsForValue().increment(redisKey, -1L);
        } else {
            redis.opsForValue().set(redisKey, "0");
        }
    }

    /* ========================== 조회수 증가 ======================== */

    public void addView(Long postId) {
        redis.opsForValue().increment(key(postId, "view"));
    }

    /* ========================== 댓글수 증가 ======================== */

    public void addComment(Long postId) {
        redis.opsForValue().increment(key(postId, "comment"));
    }

    /* ========================== 추천/비추천 ======================== */

    @Transactional
    public CommunityPostReactionResponse reactToPost(Long postId, UserEntity user, Integer newValue) {

        CommunityPostEntity post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 존재하지 않습니다. id=" + postId));

        CommunityPostReactionEntity existing = reactionRepository
                .findByPostAndUser(post, user)
                .orElse(null);

        int oldValue = (existing != null) ? existing.getReactionValue() : 0;

        String likeKey = key(postId, "like");
        String dislikeKey = key(postId, "dislike");

        // 0) same value -> nothing changes
        if (oldValue == newValue) {
            return new CommunityPostReactionResponse(
                    postId,
                    getCount(postId, "like"),
                    getCount(postId, "dislike"),
                    newValue
            );
        }

        // 1) old 반응 제거
        if (oldValue == 1) {
            safeDecrement(likeKey);
        } else if (oldValue == -1) {
            safeDecrement(dislikeKey);
        }

        // 2) new 반응 적용
        if (newValue == 1) {
            redis.opsForValue().increment(likeKey, 1L);
        } else if (newValue == -1) {
            redis.opsForValue().increment(dislikeKey, 1L);
        }

        // 3) DB 기록 업데이트
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

        long like = getCount(postId, "like");
        long dislike = getCount(postId, "dislike");

        return new CommunityPostReactionResponse(postId, like, dislike, newValue);
    }

    /* ========================= 외부 조회용 ========================= */

    public long getViewCount(Long postId) { return getCount(postId, "view"); }

    public long getCommentCount(Long postId) { return getCount(postId, "comment"); }

    public long getLikeCount(Long postId) { return getCount(postId, "like"); }

    public long getDislikeCount(Long postId) { return getCount(postId, "dislike"); }

    /* ========================== 게시글 삭제 시 반응 삭제 ======================== */

    @Transactional
    public void deleteAllReactionsByPostId(Long postId) {
        CommunityPostEntity post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다. id=" + postId));
        reactionRepository.deleteByPost(post);
    }
}
