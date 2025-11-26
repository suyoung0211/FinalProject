package org.usyj.makgora.response.vote;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class IssueResponse {
    private Integer id;
    private Integer articleId;
    private String title;
    private String content;
    private String thumbnail;
    private String status;
    private LocalDateTime createdAt;
}