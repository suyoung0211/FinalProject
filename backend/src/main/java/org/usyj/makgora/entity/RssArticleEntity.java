package org.usyj.makgora.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "rss_articles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RssArticleEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "article_id")
    private Integer id;

    // 어느 피드에서 수집되었는지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "feed_id", nullable = false)
    private RssFeedEntity feed;

    // 기사 카테고리 (feed와 동일)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private ArticleCategoryEntity category;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(nullable = false, length = 500, unique = true)
    private String link;

    @Lob
    private String content;

    @Column(length = 500)
    private String thumbnailUrl;

    private LocalDateTime publishedAt;

    @Column(nullable = false)
    @Builder.Default
    private boolean isDeleted = false;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
