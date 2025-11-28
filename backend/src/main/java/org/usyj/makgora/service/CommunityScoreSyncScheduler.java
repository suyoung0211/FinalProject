package org.usyj.makgora.service;

import java.util.Set;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.community.repository.CommunityPostRepository;
import org.usyj.makgora.entity.CommunityPostEntity;

import lombok.RequiredArgsConstructor;

// src/main/java/.../CommunityScoreSyncScheduler.java
@Service
@RequiredArgsConstructor
public class CommunityScoreSyncScheduler {

    private final StringRedisTemplate redis;
    private final CommunityPostRepository postRepo;
    private final IssueTriggerPushService triggerPushService;

    @Scheduled(fixedDelay = 10000)
    @Transactional
    public void syncScores() {

        Set<String> keys = redis.keys("cp:*:view");
        if (keys == null) return;

        for (String viewKey : keys) {

            int postId = extractId(viewKey);

            long views = getLong("cp:" + postId + ":view");
            long likes = getLong("cp:" + postId + ":like");
            long comments = getLong("cp:" + postId + ":comment");

            int score = (int) (views * 0.05 + likes * 2 + comments * 2);

            redis.opsForValue().set("cp:" + postId + ":score", String.valueOf(score));

            CommunityPostEntity post = postRepo.findById((long) postId).orElse(null);

            if (post == null) continue;

            post.setViewCount((int) views);
            post.setRecommendationCount((int) likes);
            post.setCommentCount((int) comments);
            post.setAiSystemScore(score);
            postRepo.save(post);

            triggerPushService.checkAndPushCommunity(postId, score);
        }
    }

    private long getLong(String key) {
        String v = redis.opsForValue().get(key);
        return v != null ? Long.parseLong(v) : 0;
    }

    private int extractId(String key) {
        return Integer.parseInt(key.split(":")[1]);
    }
}
