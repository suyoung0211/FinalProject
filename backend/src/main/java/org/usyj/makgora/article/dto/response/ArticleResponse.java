package org.usyj.makgora.article.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.Set;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArticleResponse {

    private Integer id;
    private String sourceName;
    private String url;
    private Set<String> categories; // 카테고리명
    private int articleCount;          // 기사 수
    private LocalDateTime lastFetched;
    private String status;           // "active" / "inactive"
}