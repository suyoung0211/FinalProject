package org.usyj.makgora.entity;

import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "feed_id", nullable = false)
    private RssFeedEntity feed;

    @ManyToMany
    @JoinTable(
    name = "article_categories_mapping",
    joinColumns = @JoinColumn(name = "article_id"),
    inverseJoinColumns = @JoinColumn(name = "category_id"),
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_article_category_mapping",
            columnNames = { "article_id", "category_id" }
        )
    }
)
    @Builder.Default
    private Set<ArticleCategoryEntity> categories = new HashSet<>();

    @Column(nullable = false, length = 500)
    private String title;

    @Column(nullable = false, length = 2000)
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

    @Column(nullable = false)
    @Builder.Default
    private int viewCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private int likeCount = 0;
    
    @Column(nullable = false)
    @Builder.Default
    private int dislikeCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private int commentCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean issueCreated = false;

    @Column(nullable = false)
private int aiSystemScore;
}