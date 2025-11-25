package org.usyj.makgora.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HotIssueDto {
    private Integer articleId;
    private String title;
    private String aiTitle;
    private String thumbnail;
    private LocalDateTime publishedAt;
    private List<String> categories;
}
