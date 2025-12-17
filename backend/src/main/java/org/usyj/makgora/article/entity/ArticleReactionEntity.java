package org.usyj.makgora.article.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import org.usyj.makgora.user.entity.UserEntity;

@Entity
@Table(
    name = "article_reactions",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_article_user",
            columnNames = {"article_id", "user_id"}
        )
    }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ArticleReactionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reaction_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id", nullable = false)
    private RssArticleEntity article;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    /** 1 = 좋아요, -1 = 싫어요 */
    @Column(name = "reaction_value", nullable = false)
    private Integer reactionValue;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}