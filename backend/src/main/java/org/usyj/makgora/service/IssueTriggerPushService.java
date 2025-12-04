package org.usyj.makgora.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.usyj.makgora.repository.IssueRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class IssueTriggerPushService {

    private final StringRedisTemplate redis;
    private final IssueRepository issueRepo;

    private static final int THRESHOLD = 20;
    private static final String QUEUE = "ISSUE_TRIGGER_QUEUE";

    /** RSS Article 트리거 */
    public void checkAndPush(int articleId, int score) {

        if (score < THRESHOLD) return;

        String flag = redis.opsForValue().get("article:" + articleId + ":triggered");
        if ("1".equals(flag)) return;

        redis.opsForList().leftPush(QUEUE, "article:" + articleId);
        System.out.println("[Trigger] Article queued: " + articleId);
    }

    /** Community Post 트리거 */
    public void checkAndPushCommunity(long postId, int score) {

        if (score < THRESHOLD) return;

        boolean exists = issueRepo.findByCommunityPostId(postId).isPresent();
        if (exists) {
            System.out.println("[Trigger] 이미 해당 Post Issue 존재 → skip: " + postId);
            return;
        }

        String flag = redis.opsForValue().get("cp:" + postId + ":triggered");
        if ("1".equals(flag)) return;

        redis.opsForList().leftPush(QUEUE, "cp:" + postId);
        System.out.println("[Trigger] CommunityPost queued: " + postId);
    }
}
