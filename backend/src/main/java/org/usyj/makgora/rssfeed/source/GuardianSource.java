package org.usyj.makgora.rssfeed.source;

import java.net.URL;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Arrays;
import java.util.Collections;

import org.springframework.stereotype.Component;
import org.usyj.makgora.rssfeed.dto.RssArticleDTO;

import com.rometools.rome.feed.module.Module;
import com.rometools.rome.feed.synd.SyndEntry;
import com.rometools.rome.feed.synd.SyndFeed;
import com.rometools.rome.io.SyndFeedInput;
import com.rometools.rome.io.XmlReader;
import com.rometools.modules.mediarss.MediaEntryModule;
import com.rometools.modules.mediarss.types.MediaContent;

@Component
public class GuardianSource implements RssFeedSource {

    @Override
    public Map<String, String> getCategoryFeeds() {
        Map<String, String> map = new HashMap<>();
        map.put("Environment", "https://www.theguardian.com/uk/environment/rss");
        return map;
    }

    @Override
    public List<RssArticleDTO> fetch(String categoryName, String feedUrl) {
        List<RssArticleDTO> items = new ArrayList<>();
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

                // MediaEntryModule 사용
                String thumbnailUrl = null;
                Module module = entry.getModule(MediaEntryModule.URI);
                if (module instanceof MediaEntryModule media) {
                    MediaContent[] mediaContents = media.getMediaContents();
                    if (mediaContents != null && mediaContents.length > 0) {
                        MediaContent largest = Arrays.stream(mediaContents)
                                .max(Comparator.comparingInt(MediaContent::getWidth))
                                .orElse(mediaContents[0]);
                        if (largest.getReference() != null) {
                            thumbnailUrl = largest.getReference().toString();
                        }
                    }
                }

                // 카테고리를 항상 리스트로 통일
                List<String> categories = Collections.singletonList(categoryName);

                // RssArticleDTO 빌더 사용
                items.add(RssArticleDTO.builder()
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