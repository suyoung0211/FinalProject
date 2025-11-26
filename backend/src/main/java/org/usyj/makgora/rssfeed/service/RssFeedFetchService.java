package org.usyj.makgora.rssfeed.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.usyj.makgora.rssfeed.dto.RssArticleDTO;
import org.usyj.makgora.rssfeed.source.RssFeedSource;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RssFeedFetchService {

    private final List<RssFeedSource> sources;

    public List<RssArticleDTO> fetchArticles(String sourceName, String categoryName, String feedUrl) {
        RssFeedSource source = sources.stream()
                .filter(s -> s.getClass().getSimpleName().startsWith(sourceName))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("RSS 소스 없음: " + sourceName));

        try {
            return source.fetch(categoryName, feedUrl);
        } catch (Exception e) {
            throw new RuntimeException("RSS 수집 실패: " + sourceName + " | " + feedUrl, e);
        }
    }
}