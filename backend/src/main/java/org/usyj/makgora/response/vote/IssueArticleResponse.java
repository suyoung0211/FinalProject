package org.usyj.makgora.response.vote;

import lombok.Builder;
import lombok.Data;
import org.usyj.makgora.entity.IssueEntity;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
public class IssueArticleResponse {

    private Integer id;           // issue_id
    private Integer articleId;    // 연관된 기사 ID

    private String title;         // Issue 제목
    private String content;       // Issue 내용
    private String thumbnail;     // Issue 썸네일
    private String source;        // 출처

    private String aiSummary;             // AI 요약
    private Map<String, Object> aiPoints; // AI 포인트

    private String status;        // PENDING / APPROVED / REJECTED
    private String createdBy;     // SYSTEM / ADMIN / AI

    private LocalDateTime createdAt;

    public static IssueArticleResponse from(IssueEntity issue) {
        return IssueArticleResponse.builder()
                .id(issue.getId())
                .articleId(issue.getArticle() != null ? issue.getArticle().getId() : null)
                .title(issue.getTitle())
                .content(issue.getContent())
                .thumbnail(issue.getThumbnail())
                .source(issue.getSource())
                .aiSummary(issue.getAiSummary())
                .aiPoints(issue.getAiPoints())
                .status(issue.getStatus().name())
                .createdBy(issue.getCreatedBy().name())
                .createdAt(issue.getCreatedAt())
                .build();
    }
}
