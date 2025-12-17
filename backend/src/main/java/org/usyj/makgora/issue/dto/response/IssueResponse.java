package org.usyj.makgora.issue.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.usyj.makgora.issue.entity.IssueEntity;

import java.util.ArrayList;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueResponse {

    private Integer id;           // Issue ID
    private String title;         // 제목
    private String source;        // "기사" 또는 "커뮤니티"
    private String status;        // PENDING, APPROVED, REJECTED
    private LocalDateTime createdAt; // 생성일
    private LocalDateTime approvedAt; // 승인시간
    private LocalDateTime rejectedAt; // 거절시간

    // AI 분석 관련 필드
    private String importance;    // aiPoints에서 importance
    private List<String> keyPoints; // aiPoints에서 key_points

    /**
     * IssueEntity → IssueResponse 변환
     * 작성자(author) 필드 제거
     */
    public static IssueResponse fromEntity(IssueEntity issue) {
        Map<String, Object> aiPoints = issue.getAiPoints();
        String importance = null;
        List<String> keyPoints = new ArrayList<>();

        if (aiPoints != null) {
            importance = (String) aiPoints.get("importance");
            Object keys = aiPoints.get("key_points");
            if (keys instanceof List<?>) {
                for (Object k : (List<?>) keys) {
                    if (k != null) keyPoints.add(k.toString());
                }
            }
        }

        String source = issue.getArticle() != null ? "기사" :
                        issue.getCommunityPost() != null ? "커뮤니티" : "알 수 없음";

        return IssueResponse.builder()
                .id(issue.getId())
                .title(issue.getTitle())
                .source(source)
                .status(issue.getStatus().name())
                .createdAt(issue.getCreatedAt())
                .approvedAt(issue.getApprovedAt())
                .rejectedAt(issue.getRejectedAt())
                .importance(importance)
                .keyPoints(keyPoints)
                .build();
    }
}
