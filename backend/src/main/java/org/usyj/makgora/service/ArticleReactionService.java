package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ArticleReactionService {

    private final StringRedisTemplate redis;
    private static final String PREFIX = "article:";

    public void increaseViewCount(Integer articleId) {
        redis.opsForValue().increment(PREFIX + articleId + ":view");
    }

    public void increaseLikeCount(Integer articleId) {
        redis.opsForValue().increment(PREFIX + articleId + ":like");
    }

    public void increaseCommentCount(Integer articleId) {
        redis.opsForValue().increment(PREFIX + articleId + ":comment");
    }
}
