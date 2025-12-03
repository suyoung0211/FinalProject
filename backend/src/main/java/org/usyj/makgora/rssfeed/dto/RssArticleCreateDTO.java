package org.usyj.makgora.rssfeed.dto;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

import com.rometools.rome.feed.synd.SyndEntry;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RssArticleCreateDTO {
    private String title;
    private String link;
    private String content;
    private LocalDateTime publishedAt;
    private String thumbnailUrl;
    private List<String> categories;

    public static RssArticleCreateDTO from(SyndEntry entry) {
        LocalDateTime publishedAt = null;
        if (entry.getPublishedDate() != null) {
            publishedAt = LocalDateTime.ofInstant(entry.getPublishedDate().toInstant(), ZoneId.systemDefault());
        }

        // 카테고리 처리: SyndEntry#getCategories() 반환 타입은 List<SyndCategory>
        List<String> categories = entry.getCategories() != null
                ? entry.getCategories().stream().map(c -> c.getName()).toList()
                : List.of();

        String content = null;
        if (entry.getContents() != null && !entry.getContents().isEmpty()) {
            content = entry.getContents().get(0).getValue();
        } else if (entry.getDescription() != null) {
            content = entry.getDescription().getValue();
        }

        // 섬네일 처리: Media RSS 확장이나 HTML img 파싱 필요시 별도 로직 필요

        return RssArticleCreateDTO.builder()
                .title(entry.getTitle())
                .link(entry.getLink())
                .content(content)
                .publishedAt(publishedAt)
                .categories(categories)
                .thumbnailUrl(null) // 필요시 파싱 로직 추가
                .build();
    }

}