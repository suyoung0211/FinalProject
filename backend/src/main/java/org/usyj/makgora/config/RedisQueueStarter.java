package org.usyj.makgora.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.boot.context.event.ApplicationReadyEvent;

import jakarta.annotation.PreDestroy;
import java.time.Duration;

@Component
@RequiredArgsConstructor
public class RedisQueueStarter {

    private final RedisTemplate<String, String> redisTemplate;

    // 안전 종료 플래그
    private volatile boolean running = true;

    @EventListener(ApplicationReadyEvent.class)
    public void startConsumer() {

        Thread consumerThread = new Thread(() -> {
            System.out.println("📌 Redis ISSUE_TRIGGER_QUEUE Consumer started...");

            while (running) {
                try {
                    // Redis가 이미 종료되었으면 탈출
                    if (!running) break;

                    // 큐에서 데이터 읽기 (1초 블로킹)
                    String item = redisTemplate.opsForList()
                            .rightPop("issue_queue", Duration.ofSeconds(1));

                    if (item != null) {
                        System.out.println("🔍 큐 처리됨: " + item);

                        // 여기서 AI 서비스 호출
                        // issueAnalysisService.process(item);
                    }

                } catch (Exception e) {
                    // Redis가 죽은 경우 → 루프 완전 종료
                    System.out.println("⚠ Redis Consumer 오류 발생 → 종료: " + e.getMessage());
                    running = false;

                    try { Thread.sleep(500); } catch (InterruptedException ignored) {}
                }
            }

            System.out.println("🔻 Redis Queue Consumer 스레드 종료됨");
        });

        consumerThread.setDaemon(true); // ✔ 서버 종료 시 자동 종료
        consumerThread.start();
    }

    @PreDestroy
    public void stop() {
        System.out.println("🔻 RedisQueueStarter 종료 시그널 감지");
        running = false;
    }
}