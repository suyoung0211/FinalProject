package org.usyj.makgora.home.dto.response;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter @Builder
public class SlideNewsResponse {
    private Integer articleId;
    private String aiTitle;
    private String thumbnail;
    private LocalDateTime publishedAt;
}