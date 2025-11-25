package org.usyj.makgora.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter @Builder
public class SlideNewsDto {
    private Integer articleId;
    private String aiTitle;
    private String thumbnail;
    private LocalDateTime publishedAt;
}