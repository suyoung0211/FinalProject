package org.usyj.makgora.rssfeed.service;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RssFeedCollector {

    private final RssFeedService rssFeedService;

    // 서버 시작 시 자동 실행
    @EventListener(ApplicationReadyEvent.class)
    @Async
    public void runAtStartup() {
        rssFeedService.collectAndSaveAllFeeds();
    }
}