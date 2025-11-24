package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Service;
import org.usyj.makgora.dto.RssItemDTO;
import org.usyj.makgora.entity.ArticleCategoryEntity;
import org.usyj.makgora.entity.RssArticleEntity;
import org.usyj.makgora.entity.RssFeedEntity;
import org.usyj.makgora.repository.ArticleCategoryRepository;
import org.usyj.makgora.repository.RssArticleRepository;
import org.usyj.makgora.repository.RssFeedRepository;

import com.rometools.rome.feed.module.Module;
import com.rometools.modules.mediarss.MediaEntryModule;
import com.rometools.modules.mediarss.types.Thumbnail;
import com.rometools.rome.feed.synd.SyndEntry;
import com.rometools.rome.feed.synd.SyndFeed;
import com.rometools.rome.io.SyndFeedInput;
import com.rometools.rome.io.XmlReader;

import jakarta.transaction.Transactional;
import java.net.URL;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RssFeedService {

    private final ArticleCategoryRepository categoryRepo;
    private final RssFeedRepository feedRepo;
    private final RssArticleRepository articleRepo;

    // RSS 피드 URL + 카테고리 맵
    private final Map<String, String> rssFeeds = Map.of(
            "BBC World", "https://feeds.bbci.co.uk/news/world/rss.xml",
            "BBC Business", "https://feeds.bbci.co.uk/news/business/rss.xml"
            // 다른 뉴스 피드 추가 가능
    );

    @Transactional
    public void collectAndSaveAllFeeds() {
        rssFeeds.forEach((categoryName, feedUrl) -> {
            // 1️⃣ 카테고리 확인/저장
            ArticleCategoryEntity category = categoryRepo.findByName(categoryName)
                    .orElseGet(() -> categoryRepo.save(
                            ArticleCategoryEntity.builder()
                                    .name(categoryName)
                                    .build()
                    ));

            // 2️⃣ RSS 피드 확인/저장
            RssFeedEntity feed = feedRepo.findByUrl(feedUrl)
                    .orElseGet(() -> feedRepo.save(
                            RssFeedEntity.builder()
                                    .url(feedUrl)
                                    .category(category)
                                    .status(RssFeedEntity.Status.ACTIVE)
                                    .build()
                    ));

            // 3️⃣ RSS 기사 파싱
            List<RssItemDTO> items = parseRss(feedUrl);

            // 4️⃣ 기사 저장
            for (RssItemDTO item : items) {
                if (articleRepo.existsByLink(item.getLink())) continue;

                RssArticleEntity article = RssArticleEntity.builder()
                        .feed(feed)
                        .category(category)
                        .title(item.getTitle())
                        .link(item.getLink())
                        .content(item.getContent())
                        .thumbnailUrl(item.getThumbnailUrl())
                        .publishedAt(item.getPublishedAt())
                        .build();

                articleRepo.save(article);
            }

            // 5️⃣ 마지막 수집 시간 업데이트
            feed.setLastFetched(LocalDateTime.now());
            feedRepo.save(feed);
        });
    }

    private List<RssItemDTO> parseRss(String feedUrl) {
        List<RssItemDTO> items = new ArrayList<>();

        try {
            URL url = new URL(feedUrl);
            SyndFeedInput input = new SyndFeedInput();
            SyndFeed feed = input.build(new XmlReader(url));

            for (SyndEntry entry : feed.getEntries()) {
                String title = entry.getTitle();
                String link = entry.getLink();

                // 1️⃣ 본문 content
                String content = null;
                if (entry.getDescription() != null) {
                    content = entry.getDescription().getValue();
                } else if (entry.getContents() != null && !entry.getContents().isEmpty()) {
                    content = entry.getContents().get(0).getValue();
                }

                // 2️⃣ 게시일
                LocalDateTime publishedAt = entry.getPublishedDate() != null
                        ? entry.getPublishedDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime()
                        : LocalDateTime.now();

                // 3️⃣ 썸네일 추출
                String thumbnailUrl = null;

                // media:thumbnail
                MediaEntryModule media = (MediaEntryModule) entry.getModule(MediaEntryModule.URI);
                if (media != null && media.getMetadata() != null) {
                    Thumbnail[] thumbs = media.getMetadata().getThumbnail();
                    if (thumbs != null && thumbs.length > 0) {
                        thumbnailUrl = thumbs[0].getUrl().toString();
                    }
                }

                // content 안에 <img> 태그 fallback
                if (thumbnailUrl == null && content != null) {
                    Document doc = Jsoup.parse(content);
                    Element img = doc.selectFirst("img");
                    if (img != null) {
                        thumbnailUrl = img.attr("src");
                    }
                }

                // DTO 생성
                RssItemDTO itemDTO = new RssItemDTO(
                        title,
                        link,
                        content,
                        publishedAt,
                        thumbnailUrl
                );

                items.add(itemDTO);
            }

            // 디버깅: 실제 몇 건 가져왔는지 확인
            System.out.println("Parsed " + items.size() + " items from feed: " + feedUrl);

        } catch (Exception e) {
            e.printStackTrace();
        }

        return items;
    }
}
