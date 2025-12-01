package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.RssArticleEntity;
import org.usyj.makgora.rssfeed.repository.RssArticleRepository;

@Service
@RequiredArgsConstructor
public class ArticleViewService {

    private final StringRedisTemplate redis;
    private final RssArticleRepository articleRepo;

    private static final String PREFIX = "article:";

    /**
     * 조회수 증가
     * Redis + DB 동시 반영
     */
    @Transactional
    public void addView(Integer articleId) {

        // Redis 증가
        redis.opsForValue().increment(PREFIX + articleId + ":view");

        // DB 증가
        RssArticleEntity article = articleRepo.findById(articleId).orElse(null);
        if (article != null) {
            article.setViewCount(article.getViewCount() + 1);
            articleRepo.save(article);
        }
    }
}
