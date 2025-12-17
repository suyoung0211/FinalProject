package org.usyj.makgora.issue.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.usyj.makgora.community.repository.CommunityPostRepository;
import org.usyj.makgora.issue.repository.IssueRepository;
import org.usyj.makgora.rssfeed.repository.RssArticleRepository;

@Service
@RequiredArgsConstructor
public class IssueTriggerPushService {

    private final StringRedisTemplate redis;
    private final IssueRepository issueRepo;

    private final CommunityPostRepository communityPostRepository;   // 🔥 추가
    private final RssArticleRepository rssArticleRepository;         // 🔥 추가

    private static final int THRESHOLD = 20;
    private static final String QUEUE = "ISSUE_TRIGGER_QUEUE";

    // =========================================================
    // 🔥 RSS Article 트리거
    // =========================================================
    public void checkAndPush(int articleId, int score) {

        System.out.println("[TriggerDebug] ARTICLE 체크 시작 articleId=" + articleId + ", score=" + score);

        // 1) 존재 여부 체크
        if (!rssArticleRepository.existsById(articleId)) {
            System.out.println("[TriggerDebug] 존재하지 않는 Article → skip articleId=" + articleId);
            return;
        }

        // 2) 점수 부족
        if (score < THRESHOLD) {
            System.out.println("[TriggerDebug] 점수 부족 → skip articleId=" + articleId);
            return;
        }

        // 3) 이미 Issue 생성됨?
        boolean exists = issueRepo.findByArticleId(articleId).isPresent();
        if (exists) {
            System.out.println("[TriggerDebug] 이미 Issue 존재 → skip articleId=" + articleId);
            return;
        }

        // 4) Redis 플래그 체크
        String flag = redis.opsForValue().get("article:" + articleId + ":triggered");
        if ("1".equals(flag)) {
            System.out.println("[TriggerDebug] Redis triggered=1 → skip articleId=" + articleId);
            return;
        }

        // 5) QUEUE push
        redis.opsForList().leftPush(QUEUE, "article:" + articleId);
        System.out.println("[TriggerDebug] Queue push 성공 → articleId=" + articleId);
    }

    // =========================================================
    // 🔥 Community Post 트리거
    // =========================================================
    public void checkAndPushCommunity(long postId, int score) {

        System.out.println("[TriggerDebug] COMMUNITY 체크 시작 postId=" + postId + ", score=" + score);

        // 1) 존재 여부 체크 (🔥 반드시 필요)
        if (!communityPostRepository.existsById(postId)) {
            System.out.println("[TriggerDebug] 존재하지 않는 PostId → skip postId=" + postId);
            return;
        }

        // 2) 점수 부족
        if (score < THRESHOLD) {
            System.out.println("[TriggerDebug] 점수 부족 → skip postId=" + postId);
            return;
        }

        // 3) 이미 Issue 생성됨?
        boolean exists = issueRepo.findByCommunityPostId(postId).isPresent();
        if (exists) {
            System.out.println("[TriggerDebug] 이미 Issue 존재 → skip postId=" + postId);
            return;
        }

        // 4) Redis flagged?
        String flag = redis.opsForValue().get("cp:" + postId + ":triggered");
        if ("1".equals(flag)) {
            System.out.println("[TriggerDebug] Redis triggered=1 → skip postId=" + postId);
            return;
        }

        // 5) Queue push
        redis.opsForList().leftPush(QUEUE, "cp:" + postId);
        System.out.println("[TriggerDebug] Queue push 성공 → postId=" + postId);
    }
}
