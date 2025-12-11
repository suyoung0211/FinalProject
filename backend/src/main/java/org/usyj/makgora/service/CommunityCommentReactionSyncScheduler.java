package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.usyj.makgora.community.repository.CommunityCommentRepository;
import org.usyj.makgora.entity.CommunityCommentEntity;

import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class CommunityCommentReactionSyncScheduler {

    private final StringRedisTemplate redis;
    private final CommunityCommentRepository commentRepo;

    private String likeCountKey(Long id) {
        return "community:comment:" + id + ":like:count";
    }

    private String dislikeCountKey(Long id) {
        return "community:comment:" + id + ":dislike:count";
    }

    /**
     * 🔥 5분마다 Redis → DB 반영
     */
    @Scheduled(fixedRate = 60 * 60 * 1000)
    public void syncCommentReactions() {

        log.info("[Scheduler] 댓글 반응 동기화 시작");

        // Redis 저장된 모든 댓글 LikeCount Key 스캔
        Set<String> keys = redis.keys("community:comment:*:like:count");
        if (keys == null || keys.isEmpty()) {
            log.info("[Scheduler] 업데이트할 댓글 없음");
            return;
        }

        for (String key : keys) {
            try {
                Long commentId = Long.parseLong(key.split(":")[2]);

                String like = redis.opsForValue().get(likeCountKey(commentId));
                String dislike = redis.opsForValue().get(dislikeCountKey(commentId));

                long likeCount = like != null ? Long.parseLong(like) : 0L;
                long dislikeCount = dislike != null ? Long.parseLong(dislike) : 0L;

                // DB에서 댓글 찾기
                CommunityCommentEntity comment =
                        commentRepo.findById(commentId).orElse(null);

                if (comment == null) continue;

                // DB에 반영
                comment.setLikeCount((int) likeCount);
                comment.setDislikeCount((int) dislikeCount);

                commentRepo.save(comment);

            } catch (Exception e) {
                log.error("[Scheduler] 댓글 반응 업데이트 실패: key = " + key, e);
            }
        }

        log.info("[Scheduler] 댓글 반응 동기화 완료");
    }
}