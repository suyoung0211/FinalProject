package org.usyj.makgora.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;

import jakarta.annotation.PreDestroy;
import java.time.Duration;

@Component
@RequiredArgsConstructor
@EnableAsync // @Async 활성화
public class RedisQueueStarter {

    private final RedisTemplate<String, String> redisTemplate;

    private volatile boolean running = true;

    private static final String ISSUE_QUEUE = "issue_queue";

    /**
     * 서버 완전히 올라온 후 Redis Consumer 시작
     */
    @EventListener(ApplicationReadyEvent.class)
    public void startConsumer() {
        startRedisConsumerAsync();
    }

    /**
     * 실제 Redis Consumer를 @Async로 실행
     */
    @Async
    public void startRedisConsumerAsync() {
        try {
            // 서버 초기화 안정화 시간
            Thread.sleep(5000);
        } catch (InterruptedException ignored) {}

        System.out.println("📌 Redis ISSUE_QUEUE Consumer started...");

        while (running) {
            try {
                if (redisTemplate == null) {
                    System.err.println("⚠ RedisTemplate is null. Retrying in 5s...");
                    Thread.sleep(5000);
                    continue;
                }

                // 1초 블로킹 pop
                String item = redisTemplate.opsForList()
                        .rightPop(ISSUE_QUEUE, Duration.ofSeconds(1));

                if (item != null) {
                    System.out.println("🔍 큐 처리됨: " + item);
                    // TODO: 실제 서비스 호출
                }

            } catch (Exception e) {
                System.err.println("⚠ Redis Consumer 오류 발생: " + e.getMessage() + " → 5초 후 재시도");
                try {
                    Thread.sleep(5000);
                } catch (InterruptedException ignored) {}
            }
        }

        System.out.println("🔻 Redis Queue Consumer 종료됨");
    }

    /**
     * 안전 종료
     */
    @PreDestroy
    public void stop() {
        System.out.println("🔻 RedisQueueStarter 종료 시그널 감지");
        running = false;
    }
}