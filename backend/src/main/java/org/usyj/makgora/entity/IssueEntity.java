package org.usyj.makgora.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "Issues")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "issue_id")
    private Integer id;

    // 연관 관계
    @ManyToOne
    @JoinColumn(name = "article_id", referencedColumnName = "article_id", foreignKey = @ForeignKey(name = "fk_issue_article"))
    private Article article;

    @ManyToOne
    @JoinColumn(name = "community_post_id", referencedColumnName = "post_id", foreignKey = @ForeignKey(name = "fk_issue_community_post"))
    private CommunityPost communityPost;

    // 일반 컬럼
    @Column(nullable = false)
    private String title;

    private String thumbnail;

    @Lob
    private String content;

    private String source;

    @Lob
    private String aiSummary;

    // JSON 컬럼 처리: Map<String, Object> 사용
    @Convert(converter = JpaJsonConverter.class)
    @Column(columnDefinition = "json")
    private Map<String, Object> aiPoints;

    // ENUM 컬럼
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.PENDING;

    private LocalDateTime approvedAt;
    private LocalDateTime rejectedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CreatedBy createdBy = CreatedBy.AI;

    // 타임스탬프
    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // ENUM 정의
    public enum Status {
        PENDING, APPROVED, REJECTED
    }

    public enum CreatedBy {
        SYSTEM, ADMIN, AI
    }
}