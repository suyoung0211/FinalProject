package org.usyj.makgora.dto.home;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter @Builder
public class AiBannerDto {
    private Integer articleId;
    private String aiTitle;
    private String thumbnail;
}