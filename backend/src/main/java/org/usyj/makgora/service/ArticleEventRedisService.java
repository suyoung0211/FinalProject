package org.usyj.makgora.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ArticleEventRedisService {

    private final StringRedisTemplate redis;

    public void addView(int articleId) {
        redis.opsForValue().increment("article:" + articleId + ":view");
    }

    public void addLike(int articleId) {
        redis.opsForValue().increment("article:" + articleId + ":like");
    }

    public void addComment(int articleId) {
        redis.opsForValue().increment("article:" + articleId + ":comment");
    }
}