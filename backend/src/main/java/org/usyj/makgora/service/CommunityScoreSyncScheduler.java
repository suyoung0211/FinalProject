package org.usyj.makgora.service;

import java.util.Set;

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

    // @Scheduled(fixedDelay = 10000)
    @Transactional
    public void syncScores() {

        Set<String> keys = redis.keys("cp:*:view");
        if (keys == null) return;

        for (String viewKey : keys) {

            int postId = extractId(viewKey);

            // -----------------------
            // 🔹 1) DB에서 현재값 가져오기
            // -----------------------
            CommunityPostEntity post = postRepo.findById((long) postId).orElse(null);
            if (post == null) continue;

            int dbViews = post.getViewCount();
            int dbLikes = post.getRecommendationCount();
            int dbComments = post.getCommentCount();

            // -----------------------
            // 🔹 2) Redis는 그냥 캐시이므로
            //     무조건 DB 값으로 덮어쓴다
            // -----------------------
            redis.opsForValue().set("cp:" + postId + ":view", String.valueOf(dbViews));
            redis.opsForValue().set("cp:" + postId + ":like", String.valueOf(dbLikes));
            redis.opsForValue().set("cp:" + postId + ":comment", String.valueOf(dbComments));

            // -----------------------
            // 🔹 3) 점수 계산도 DB 기준
            // -----------------------
            int score = (int) (dbViews * 0.05 + dbLikes * 2 + dbComments * 2);

            post.setAiSystemScore(score);
            postRepo.save(post);

            redis.opsForValue().set("cp:" + postId + ":score", String.valueOf(score));

            // -----------------------
            // 🔹 4) 임계치 넘으면 트리거
            // -----------------------
            triggerPushService.checkAndPushCommunity(postId, score);
        }
    }

    private int extractId(String key) {
        return Integer.parseInt(key.split(":")[1]);
    }
}
