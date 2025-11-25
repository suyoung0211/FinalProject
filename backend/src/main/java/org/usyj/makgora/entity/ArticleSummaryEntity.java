package org.usyj.makgora.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "Article_Summaries",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_summary_article",
                        columnNames = {"article_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArticleSummaryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "summary_id")
    private Integer id;

    // 연관 관계: 기사 (기사당 1개의 요약 행을 유지)
    @OneToOne
    @JoinColumn(
            name = "article_id",
            referencedColumnName = "article_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_summary_article")
    )
    private RssArticleEntity article;

    // 요약 결과 (성공한 경우에만 채워짐)
    @Lob
    @Column(name = "summary_text")
    private String summaryText;

    // AI 모델명 (선택)
    @Column(name = "model_name", length = 100)
    private String modelName;

    // 요약 상태: PENDING / PROCESSING / SUCCESS / FAILED
    @Column(name = "status", nullable = false, length = 20)
    private String status;

    // 요약 재시도 횟수
    @Column(name = "try_count", nullable = false)
    private Integer tryCount;

    // 마지막 실패 이유 (null 가능)
    @Column(name = "last_error", columnDefinition = "TEXT")
    private String lastError;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // 마지막 성공 시각
    private LocalDateTime lastSuccessAt;
}