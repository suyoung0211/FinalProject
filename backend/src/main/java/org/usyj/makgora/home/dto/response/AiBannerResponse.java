package org.usyj.makgora.home.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter @Builder
public class AiBannerResponse {
    private Integer articleId;
    private String aiTitle;
    private String thumbnail;
}