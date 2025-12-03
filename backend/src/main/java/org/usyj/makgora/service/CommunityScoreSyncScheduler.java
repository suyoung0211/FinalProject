package org.usyj.makgora.service;

import java.util.List;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.community.repository.CommunityPostRepository;
import org.usyj.makgora.entity.CommunityPostEntity;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommunityScoreSyncScheduler {

    private final StringRedisTemplate redis;
    private final CommunityPostRepository postRepo;
    private final IssueTriggerPushService triggerPushService;

    private int getInt(String key) {
        String value = redis.opsForValue().get(key);
        return (value != null) ? Integer.parseInt(value) : 0;
    }

    @Scheduled(fixedDelay = 60 * 1000) // 1시간마다
    @Transactional
    public void syncScores() {

        // 📌 keys() 제거 — DB 기준으로 모든 글을 Sync
        List<CommunityPostEntity> posts = postRepo.findAll();
        if (posts.isEmpty()) return;

        for (CommunityPostEntity post : posts) {

            long postId = post.getPostId();

            // 1) Redis 최신값 읽기
            int views = getInt("cp:" + postId + ":view");
            int likes = getInt("cp:" + postId + ":like");
            int comments = getInt("cp:" + postId + ":comment");

            // 2) DB 반영 (Redis → DB)
            post.setViewCount(views);
            post.setRecommendationCount(likes);
            post.setCommentCount(comments);

            // 3) 점수 계산
            int score = (int) (views * 0.05 + likes * 2 + comments * 2);
            post.setAiSystemScore(score);
            postRepo.save(post);

            // 4) Redis에는 score만 남긴다
            redis.opsForValue().set("cp:" + postId + ":score", String.valueOf(score));

            // 5) 임계치 체크 후 트리거
            triggerPushService.checkAndPushCommunity(postId, score);
        }
    }
}
