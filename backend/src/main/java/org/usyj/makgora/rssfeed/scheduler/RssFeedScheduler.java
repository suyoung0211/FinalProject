package org.usyj.makgora.rssfeed.scheduler;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.usyj.makgora.rssfeed.repository.RssFeedRepository;
import org.usyj.makgora.rssfeed.service.RssArticleService;
import org.usyj.makgora.rssfeed.service.RssParserService;

@Component
@RequiredArgsConstructor
public class RssFeedScheduler {

    private final RssFeedRepository feedRepository;
    private final RssParserService rssParser;
    private final RssArticleService articleService;

    // 3시간마다 실행 (3시간 = 3 * 60 * 60 * 1000 ms)
    @Scheduled(fixedDelay = 3 * 60 * 60 * 1000)
    public void collectFeeds() {
        feedRepository.findAllActiveFeeds().forEach(feed -> {
            try {
                var items = rssParser.parse(feed.getUrl());
                items.forEach(item -> articleService.saveArticle(item, feed));
            } catch (Exception e) {
                System.out.println("RSS 수집 중 오류 발생: " + e.getMessage());
            }
        });
    }
}