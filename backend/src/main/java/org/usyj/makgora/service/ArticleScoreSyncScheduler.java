// src/main/java/org/usyj/makgora/service/ArticleScoreSyncScheduler.java
package org.usyj.makgora.service;

import java.util.Set;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.usyj.makgora.entity.RssArticleEntity;
import org.usyj.makgora.rssfeed.repository.RssArticleRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ArticleScoreSyncScheduler {

    private final StringRedisTemplate redis;
    private final RssArticleRepository articleRepo;
    private final IssueTriggerPushService triggerPushService;

    @Scheduled(fixedDelay = 60 * 60 * 1000) // 1시간마다
    @Transactional
    public void syncScores() {

        Set<String> keys = redis.keys("article:*:view");
        if (keys == null) return;

        for (String viewKey : keys) {

            int articleId = extractId(viewKey);

            long views = getLong("article:" + articleId + ":view");
            long likes = getLong("article:" + articleId + ":like");
            long comments = getLong("article:" + articleId + ":comment");

            int score = (int) (views * 0.1 + likes * 2 + comments * 3);

            redis.opsForValue().set("article:" + articleId + ":score", String.valueOf(score));

            // DB 업데이트
            RssArticleEntity article = articleRepo.findById(articleId).orElse(null);
            if (article == null) continue;

            article.setViewCount((int) views);
            article.setLikeCount((int) likes);
            article.setCommentCount((int) comments);
            article.setAiSystemScore(score);

            articleRepo.save(article);

            // Redis Queue 에 푸시 판단
            triggerPushService.checkAndPush(articleId, score);
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
