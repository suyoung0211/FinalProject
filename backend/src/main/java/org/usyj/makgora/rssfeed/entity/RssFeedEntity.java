package org.usyj.makgora.rssfeed.entity;

import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.usyj.makgora.article.entity.ArticleCategoryEntity;
import org.usyj.makgora.article.entity.RssArticleEntity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "rss_feeds")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RssFeedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "feed_id")
    private Integer id;

    @Column(nullable = false, length = 500)
    private String url;

    @Column(nullable = false, length = 100)
    private String sourceName;

    @ManyToMany
    @JoinTable(
        name = "rss_feed_categories",
        joinColumns = @JoinColumn(name = "feed_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    @Builder.Default
    private Set<ArticleCategoryEntity> categories = new HashSet<>();

    @OneToMany(
        mappedBy = "feed", // RssArticleEntity에서 feed 필드와 매핑
        cascade = CascadeType.ALL, // 피드 삭제 시 기사도 삭제
        orphanRemoval = true // 연관관계 끊긴 기사 삭제
    )
    @Builder.Default
    private Set<RssArticleEntity> articles = new HashSet<>();

    private LocalDateTime lastFetched;

    @Enumerated(EnumType.STRING)
    @Column(length = 10, nullable = false)
    @Builder.Default
    private Status status = Status.ACTIVE;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public enum Status {
        ACTIVE,
        INACTIVE
    }
}