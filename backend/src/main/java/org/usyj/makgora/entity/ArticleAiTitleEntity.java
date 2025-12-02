package org.usyj.makgora.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "article_ai_titles",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_article_ai_title",
                        columnNames = {"article_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArticleAiTitleEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ai_title_id")
    private Integer id;

    // 연관 관계: 기사 (기사당 1개의 AI 제목 행을 유지)
    @OneToOne
    @JoinColumn(
            name = "article_id",
            referencedColumnName = "article_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_ai_title_article")
    )
    private RssArticleEntity article;

    // AI가 재작성한 제목 (성공한 경우에만 채워짐)
    @Lob
    @Column(name = "ai_title")
    private String aiTitle;

    // AI 모델명 (선택)
    @Column(name = "model_name", length = 100)
    private String modelName;

    // 제목 생성 상태
    @Column(name = "status", nullable = false, length = 20)
    private String status;

    // 제목 생성 재시도 횟수
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
