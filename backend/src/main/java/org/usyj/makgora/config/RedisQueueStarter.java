package org.usyj.makgora.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.boot.context.event.ApplicationReadyEvent;

import java.time.Duration;

@Component
@RequiredArgsConstructor
public class RedisQueueStarter {

    private final RedisTemplate<String, String> redisTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void startConsumer() {

        // 별도 스레드로 큐 처리 시작
        new Thread(() -> {
            System.out.println("📌 Redis Queue Consumer started...");

            while (true) {
                try {
                    // 큐에서 데이터 읽기 (없으면 1초 대기)
                    String item = redisTemplate.opsForList()
                            .rightPop("issue_queue", Duration.ofSeconds(1));

                    if (item != null) {
                        System.out.println("🔍 큐 처리됨: " + item);

                        // 👉 여기서 실제 AI 분석/이슈 생성 서비스 호출 가능
                        // ex) issueAnalysisService.process(item);
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }).start();
    }
}
