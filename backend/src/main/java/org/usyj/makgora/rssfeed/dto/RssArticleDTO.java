package org.usyj.makgora.rssfeed.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RssArticleDTO {
    private String title;
    private String link;
    private String content;
    private LocalDateTime publishedAt;
    private String thumbnailUrl;
    private List<String> categories;
}