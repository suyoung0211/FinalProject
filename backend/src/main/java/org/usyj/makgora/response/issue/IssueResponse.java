// src/main/java/org/usyj/makgora/response/issue/IssueResponse.java
package org.usyj.makgora.response.issue;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

import org.usyj.makgora.issue.entity.IssueEntity;

@Data
@Builder
@AllArgsConstructor
public class IssueResponse {

    private Integer id;
    private Integer articleId;
    private String title;
    private String thumbnail;
    private String content;
    private String source;
    private String aiSummary;
    private Map<String, Object> aiPoints;
    private IssueEntity.Status status;
    private IssueEntity.CreatedBy createdBy;
    private LocalDateTime createdAt;

    public static IssueResponse from(IssueEntity issue) {
        return IssueResponse.builder()
                .id(issue.getId())
                .articleId(
                        issue.getArticle() != null
                                ? issue.getArticle().getId()
                                : null
                )
                .title(issue.getTitle())
                .thumbnail(issue.getThumbnail())
                .content(issue.getContent())
                .source(issue.getSource())
                .aiSummary(issue.getAiSummary())
                .aiPoints(issue.getAiPoints())
                .status(issue.getStatus())
                .createdBy(issue.getCreatedBy())
                .createdAt(issue.getCreatedAt())
                .build();
    }
}
