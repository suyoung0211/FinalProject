package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.ArticleReactionEntity;
import org.usyj.makgora.entity.RssArticleEntity;
import org.usyj.makgora.entity.UserEntity;
import org.usyj.makgora.repository.ArticleReactionRepository;
import org.usyj.makgora.rssfeed.repository.RssArticleRepository;
import org.usyj.makgora.response.article.ArticleReactionResponse;

@Service
@RequiredArgsConstructor
public class ArticleReactionService {

    private final RssArticleRepository articleRepo;
    private final ArticleReactionRepository reactionRepo;
    private final StringRedisTemplate redis;
    private final RssArticleScoreService scoreService;
    private final IssueTriggerPushService triggerPushService;

    private static final String PREFIX = "article:";

    /** 조회수 증가 */
    @Transactional
    public void addView(Integer articleId) {

        redis.opsForValue().increment(PREFIX + articleId + ":view");

        RssArticleEntity article = articleRepo.findById(articleId).orElse(null);
        if (article != null) {
            article.setViewCount(article.getViewCount() + 1);
            articleRepo.save(article);

            // 점수 계산 + 트리거 체크
            int score = scoreService.updateScoreAndReturn(article);
            triggerPushService.checkAndPush(articleId, score);
        }
    }

    /** 댓글수 증가 */
    @Transactional
    public void addComment(Integer articleId) {

        redis.opsForValue().increment(PREFIX + articleId + ":comment");

        RssArticleEntity article = articleRepo.findById(articleId).orElse(null);
        if (article != null) {
            article.setCommentCount(article.getCommentCount() + 1);
            articleRepo.save(article);

            int score = scoreService.updateScoreAndReturn(article);
            triggerPushService.checkAndPush(articleId, score);
        }
    }

     /** 좋아요/싫어요 */
    @Transactional
    public ArticleReactionResponse react(Integer articleId, Integer userId, Integer newValue) {

        RssArticleEntity article = articleRepo.findById(articleId)
                .orElseThrow(() -> new IllegalArgumentException("기사 없음 id=" + articleId));

        ArticleReactionEntity existing =
                reactionRepo.findByArticleIdAndUserId(articleId, userId).orElse(null);

        int oldValue = existing != null ? existing.getReactionValue() : 0;

        // 변경 없는 경우
        if (oldValue == newValue) {
            return new ArticleReactionResponse(
                    articleId,
                    article.getLikeCount(),
                    article.getDislikeCount(),
                    newValue
            );
        }

        // 🔥 음수 방지 포함한 count 조정
        if (oldValue == 1) {
            article.setLikeCount(Math.max(0, article.getLikeCount() - 1));
        }
        if (oldValue == -1) {
            article.setDislikeCount(Math.max(0, article.getDislikeCount() - 1));
        }

        if (newValue == 1) {
            article.setLikeCount(article.getLikeCount() + 1);
        }
        if (newValue == -1) {
            article.setDislikeCount(article.getDislikeCount() + 1);
        }

        articleRepo.save(article);

        // Redis sync
        redis.opsForValue().set(PREFIX + articleId + ":like", String.valueOf(article.getLikeCount()));
        redis.opsForValue().set(PREFIX + articleId + ":dislike", String.valueOf(article.getDislikeCount()));

        // Reaction CRUD
        if (newValue == 0) {
            if (existing != null) reactionRepo.delete(existing);
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

        // 점수 계산 + 트리거
        int score = scoreService.updateScoreAndReturn(article);
        triggerPushService.checkAndPush(articleId, score);

        return new ArticleReactionResponse(
                articleId,
                article.getLikeCount(),
                article.getDislikeCount(),
                newValue
        );
    }
}
