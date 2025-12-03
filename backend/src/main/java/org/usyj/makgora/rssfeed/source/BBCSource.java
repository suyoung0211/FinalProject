package org.usyj.makgora.rssfeed.source;

import java.net.URL;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;
import org.usyj.makgora.rssfeed.dto.RssArticleCreateDTO;

import com.rometools.modules.mediarss.MediaEntryModule;
import com.rometools.modules.mediarss.types.Thumbnail;
import com.rometools.rome.feed.synd.SyndEntry;
import com.rometools.rome.feed.synd.SyndFeed;
import com.rometools.rome.io.SyndFeedInput;
import com.rometools.rome.io.XmlReader;

@Component
public class BBCSource implements RssFeedSource {

    @Override
    public Map<String, String> getCategoryFeeds() {
        Map<String, String> map = new HashMap<>();
        map.put("경제", "https://feeds.bbci.co.uk/news/business/rss.xml");
        map.put("스포츠", "https://feeds.bbci.co.uk/sport/cricket/rss.xml");
        map.put("연예/문화", "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml");
        return map;
    }

    @Override
    public List<RssArticleCreateDTO> fetch(String categoryName, String feedUrl) {
        List<RssArticleCreateDTO> items = new ArrayList<>();
        try {
            URL url = new URL(feedUrl);
            SyndFeed feed = new SyndFeedInput().build(new XmlReader(url));

            for (SyndEntry entry : feed.getEntries()) {
                String title = entry.getTitle();
                String link = entry.getLink();
                String content = entry.getDescription() != null ? entry.getDescription().getValue() : null;

                LocalDateTime publishedAt = entry.getPublishedDate() != null
                        ? entry.getPublishedDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime()
                        : LocalDateTime.now();

                String thumbnailUrl = null;
                MediaEntryModule media = (MediaEntryModule) entry.getModule(MediaEntryModule.URI);
                if (media != null && media.getMetadata() != null && media.getMetadata().getThumbnail() != null) {
                    Thumbnail[] thumbs = media.getMetadata().getThumbnail();
                    if (thumbs.length > 0) thumbnailUrl = thumbs[0].getUrl().toString();
                }

                // 카테고리를 항상 리스트로 통일
                List<String> categories = Collections.singletonList(categoryName);

                items.add(RssArticleCreateDTO.builder()
                        .title(title)
                        .link(link)
                        .content(content)
                        .publishedAt(publishedAt)
                        .thumbnailUrl(thumbnailUrl)
                        .categories(categories)
                        .build());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return items;
    }
}
