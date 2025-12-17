package org.usyj.makgora.article.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.article.dto.response.ArticleReactionResponse;
import org.usyj.makgora.article.entity.ArticleReactionEntity;
import org.usyj.makgora.article.repository.ArticleReactionRepository;
import org.usyj.makgora.entity.RssArticleEntity;
import org.usyj.makgora.entity.UserEntity;
import org.usyj.makgora.rssfeed.repository.RssArticleRepository;
import org.usyj.makgora.service.IssueTriggerPushService;

@Service
@RequiredArgsConstructor
public class ArticleReactionService {

    private final RssArticleRepository articleRepo;
    private final ArticleReactionRepository reactionRepo;
    private final StringRedisTemplate redis;
    private final IssueTriggerPushService triggerPushService;

    private static final String PREFIX = "article:";

    /* ======================= Redis key builder ======================== */

    private String key(int id, String type) {
        return PREFIX + id + ":" + type; // article:22:like
    }

    private long getCount(int id, String type) {
        String v = redis.opsForValue().get(key(id, type));
        return (v == null) ? 0 : Long.parseLong(v);
    }

    /* ======================= 조회수 ======================== */

    public void addView(int articleId) {
        redis.opsForValue().increment(key(articleId, "view"));

        // 점수 계산 → 트리거
        int score = calcScore(articleId);
        triggerPushService.checkAndPush(articleId, score);
    }

    /* ======================= 댓글수 ======================== */

    public void addComment(int articleId) {
        redis.opsForValue().increment(key(articleId, "comment"));

        int score = calcScore(articleId);
        triggerPushService.checkAndPush(articleId, score);
    }

    /* ======================= 좋아요/싫어요 ======================== */

    @Transactional
public ArticleReactionResponse react(int articleId, int userId, int newValue) {

    RssArticleEntity article = articleRepo.findById(articleId)
            .orElseThrow(() -> new IllegalArgumentException("기사 없음: id=" + articleId));

    ArticleReactionEntity existing =
            reactionRepo.findByArticleIdAndUserId(articleId, userId)
                    .orElse(null);

    int oldValue = (existing != null) ? existing.getReactionValue() : 0;

    String likeKey = key(articleId, "like");
    String dislikeKey = key(articleId, "dislike");

    /* =====================================================
       0️⃣ 동일 클릭 → 토글 OFF (👍 → 0, 👎 → 0)
       ===================================================== */
    if (oldValue == newValue) {
        newValue = 0;
    }

    /* =====================================================
       1️⃣ old 반응 제거
       ===================================================== */
    if (oldValue == 1) safeDecrement(likeKey);
    if (oldValue == -1) safeDecrement(dislikeKey);

    /* =====================================================
       2️⃣ new 반응 적용
       ===================================================== */
    if (newValue == 1) redis.opsForValue().increment(likeKey);
    if (newValue == -1) redis.opsForValue().increment(dislikeKey);

    /* =====================================================
       3️⃣ DB 반응 기록
       ===================================================== */
    if (newValue == 0) {
        if (existing != null) {
            reactionRepo.delete(existing);
        }
    } else {
        if (existing == null) {
            reactionRepo.save(
                    ArticleReactionEntity.builder()
                            .article(article)
                            .user(UserEntity.builder().id(userId).build())
                            .reactionValue(newValue)
                            .build()
            );
        } else {
            existing.setReactionValue(newValue);
        }
    }

    long like = getCount(articleId, "like");
    long dislike = getCount(articleId, "dislike");

    /* =====================================================
       4️⃣ 점수 계산 → 트리거
       ===================================================== */
    int score = calcScore(articleId);
    triggerPushService.checkAndPush(articleId, score);

    return new ArticleReactionResponse(articleId, like, dislike, newValue);
}

    /* ======================= Score 계산 로직 ======================== */

    private int calcScore(int id) {
        long view = getCount(id, "view");
        long like = getCount(id, "like");
        long dislike = getCount(id, "dislike");
        long comment = getCount(id, "comment");

        // 너네가 쓰는 공식 그대로 유지
        return (int) (view * 0.1 + like * 2 + dislike * 0.5 + comment * 3);
    }

    /* ======================= 음수 방지 ======================== */

    private void safeDecrement(String key) {
        String v = redis.opsForValue().get(key);
        long current = (v == null) ? 0 : Long.parseLong(v);

        if (current > 0) redis.opsForValue().increment(key, -1);
        else redis.opsForValue().set(key, "0");
    }
}
