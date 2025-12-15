package org.usyj.makgora.rssfeed.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.usyj.makgora.rssfeed.service.FeedArticleService;

@Slf4j
@Component // 🔹 스케줄러는 반드시 Spring Bean
@RequiredArgsConstructor
public class RssFeedScheduler {

    private final FeedArticleService feedArticleService;

    /**
     * 🔹 애플리케이션 준비 완료 여부
     *
     * - ApplicationReadyEvent 이후에만 true
     * - 스케줄러 조기 실행 방지용 안전장치
     */
    private volatile boolean appReady = false;

    /**
     * 🔹 애플리케이션 완전 기동 완료 이벤트
     *
     * 이 시점:
     * - 모든 Bean 생성 완료
     * - DB 연결 완료
     * - 트랜잭션 정상 동작 보장
     */
    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        appReady = true;
        log.info("🚀 ApplicationReadyEvent 수신 - RSS 스케줄러 실행 가능 상태");
    }

    /**
     * 🔹 RSS 전체 피드 자동 수집 스케줄
     *
     * 실행 시간:
     * - 매일 08:00
     * - 12:00
     * - 16:00
     * - 20:00
     *
     * cron = "0 0 8,12,16,20 * * *"
     * └ 초 분 시 일 월 요일
     */
    @Scheduled(cron = "0 0 8,12,16,20 * * *")
    public void collectAllFeedsSchedule() {

        // 🔒 애플리케이션 준비 전 실행 차단
        if (!appReady) {
            log.warn("⛔ Application 준비 전 RSS 스케줄 실행 차단");
            return;
        }

        log.info("⏰ RSS 전체 피드 수집 스케줄 시작");

        // 👉 실제 수집 로직은 서비스에 위임
        feedArticleService.collectAllFeeds();

        log.info("✅ RSS 전체 피드 수집 스케줄 종료");
    }
}
