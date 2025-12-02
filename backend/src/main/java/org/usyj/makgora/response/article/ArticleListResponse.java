package org.usyj.makgora.response.article;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ArticleListResponse {

    private Integer id;
    private String category;
    private String title;
    private String summary;
    private String source;
    private String timeAgo;
    private String image;
}
