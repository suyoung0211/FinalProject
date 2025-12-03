package org.usyj.makgora.rssfeed.source;

import org.usyj.makgora.rssfeed.dto.RssArticleCreateDTO;
import java.util.List;
import java.util.Map;

public interface RssFeedSource {
    // 카테고리 이름 -> RSS 피드 URL
    Map<String, String> getCategoryFeeds();

    // 주어진 카테고리, URL에서 기사 리스트 반환
    List<RssArticleCreateDTO> fetch(String categoryName, String feedUrl);
}