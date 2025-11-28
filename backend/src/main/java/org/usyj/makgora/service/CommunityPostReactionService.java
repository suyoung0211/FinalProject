package org.usyj.makgora.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommunityPostReactionService {

    private final StringRedisTemplate redis;
    private static final String PREFIX = "cp:";

    public void addView(int postId) {
        redis.opsForValue().increment(PREFIX + postId + ":view");
    }

    public void addLike(int postId) {
        redis.opsForValue().increment(PREFIX + postId + ":like");
    }

    public void addComment(int postId) {
        redis.opsForValue().increment(PREFIX + postId + ":comment");
    }
}