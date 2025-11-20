package org.usyj.makgora.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "Article_Summaries")
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

    // 연관 관계: 기사
    @ManyToOne
    @JoinColumn(name = "article_id", referencedColumnName = "article_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_summary_article"))
    private RssArticleEntity article;

    @Lob
    @Column(name = "summary_text", nullable = false)
    private String summaryText;

    @Column(name = "model_name", length = 100)
    private String modelName;

    @CreationTimestamp
    private LocalDateTime createdAt;
}