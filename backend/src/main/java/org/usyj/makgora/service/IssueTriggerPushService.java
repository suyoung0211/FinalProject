// src/main/java/org/usyj/makgora/service/IssueTriggerPushService.java
package org.usyj.makgora.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class IssueTriggerPushService {

    private final StringRedisTemplate redis;

    // 임계치
    private static final int THRESHOLD = 20;
    private static final String QUEUE = "ISSUE_TRIGGER_QUEUE";

    /**
     * 기사(RSS Article)의 점수가 임계치를 넘었을 때,
     * Redis Queue에 "article:{id}" 형태로 넣어둔다.
     */
    public void checkAndPush(int articleId, int score) {

        if (score < THRESHOLD) return;

        // 이미 트리거된 기사면 push 금지
        String flag = redis.opsForValue().get("article:" + articleId + ":triggered");
        if ("1".equals(flag)) return;

        // 큐에는 prefix 포함해서 넣음
        redis.opsForList().leftPush(QUEUE, "article:" + articleId);
        System.out.println("[Trigger] Article queued: " + articleId);
    }

    /**
     * 커뮤니티 게시글의 점수가 임계치를 넘었을 때,
     * Redis Queue에 "cp:{postId}" 형태로 넣어둔다.
     */
    public void checkAndPushCommunity(long postId, int score) {

        if (score < THRESHOLD) return;

        String flag = redis.opsForValue().get("cp:" + postId + ":triggered");
        if ("1".equals(flag)) return;

        // cp:123 이런 형태로 Queue에 넣어 구분 가능
        redis.opsForList().leftPush(QUEUE, "cp:" + postId);

        System.out.println("[Trigger] CommunityPost queued: " + postId);
    }
}
