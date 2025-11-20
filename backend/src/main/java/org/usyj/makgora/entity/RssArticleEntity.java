package org.usyj.makgora.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "RSS_Articles")
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

    // 연관 관계: RSS 피드
    @ManyToOne
    @JoinColumn(name = "feed_id", referencedColumnName = "feed_id", foreignKey = @ForeignKey(name = "fk_article_feed"))
    private RssFeedEntity feed;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(nullable = false, length = 500, unique = true)
    private String link;

    @Lob
    private String content;

    private LocalDateTime publishedAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}