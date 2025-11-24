package org.usyj.makgora.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.usyj.makgora.rssfeed.service.RssFeedService;

@Component
@RequiredArgsConstructor
public class RssFeedInitializer implements ApplicationRunner {

    private final RssFeedService rssFeedService;

    @Override
    public void run(ApplicationArguments args) {
        // 기존 saveDefaultFeeds() → 확장형 collectAndSaveAllFeeds() 호출
        rssFeedService.collectAndSaveAllFeeds();
        System.out.println("RSS 피드 초기 저장 및 수집 완료");
    }
}