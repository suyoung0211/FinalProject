package org.usyj.makgora.rssfeed.scheduler;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.usyj.makgora.rssfeed.service.RssFeedService;

@Component
@RequiredArgsConstructor
public class RssFeedScheduler {

    private final RssFeedService rssFeedService;

    /**
     * 3시간마다 RSS 피드 수집
     * - RssFeedService.collectAndSaveAllFeeds() 호출
     * - 각 소스, 카테고리, 기사 저장, 중복 체크, 마지막 수집 시간 모두 처리됨
     */
    @Scheduled(fixedDelay = 3 * 60 * 60 * 1000) // 3시간마다 실행
    public void collectFeeds() {
        try {
            rssFeedService.collectAndSaveAllFeeds();
        } catch (Exception e) {
            // 로그로 에러 기록
            System.err.println("RSS 수집 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
        }
    }
}