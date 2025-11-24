package org.usyj.makgora.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RssItemDTO {
    private String title;
    private String link;
    private String content;
    private LocalDateTime publishedAt;
    private String thumbnailUrl;
}