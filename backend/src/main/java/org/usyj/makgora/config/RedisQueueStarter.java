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

    // 큐 이름 상수화
    private static final String ISSUE_QUEUE = "issue_queue";

    @EventListener(ApplicationReadyEvent.class)
    public void startConsumer() {

        Thread consumerThread = new Thread(() -> {
            System.out.println("📌 Redis ISSUE_TRIGGER_QUEUE Consumer started...");

            while (running) {
                try {
                    // 큐에서 데이터 읽기 (1초 블로킹)
                    String item = redisTemplate.opsForList()
                            .rightPop(ISSUE_QUEUE, Duration.ofSeconds(1));

                    if (item != null) {
                        System.out.println("🔍 큐 처리됨: " + item);

                        // TODO: 실제 AI 서비스 호출
                        // issueAnalysisService.process(item);
                    }

                } catch (Exception e) {
                    // Redis 연결 실패 시 로그 출력 후 재시도
                    System.out.println("⚠ Redis Consumer 오류 발생: " + e.getMessage() + " → 5초 후 재시도");

                    try {
                        Thread.sleep(5000);  // 5초 후 재시도
                    } catch (InterruptedException ignored) {}
                }
            }

            System.out.println("🔻 Redis Queue Consumer 스레드 종료됨");
        });

        // 서버 종료 시 자동 종료
        consumerThread.setDaemon(true);
        consumerThread.start();
    }

    @PreDestroy
    public void stop() {
        System.out.println("🔻 RedisQueueStarter 종료 시그널 감지");
        running = false;
    }
}
