package org.usyj.makgora.article.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.usyj.makgora.user.entity.UserEntity;

@Entity
@Table(name = "Article_Comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"article", "user", "parent", "children"})
public class ArticleCommentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id")
    private Long id;

    /** ====== 🔗 기사 FK ====== */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id", nullable = false)
    private RssArticleEntity article;

    /** ====== 🔗 작성자 FK ====== */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    /** ====== 🔗 부모 댓글(대댓글 관계) ====== */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private ArticleCommentEntity parent;

    /** ====== 🔗 자식 댓글 리스트 ====== */
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    @Builder.Default
    private List<ArticleCommentEntity> children = new ArrayList<>();

    /** ====== 댓글 내용 ====== */
    @Lob
    @Column(nullable = false)
    private String content;

    /** ====== 좋아요/싫어요 ====== */
    @Column(name = "like_count")
    @Builder.Default
    private Integer likeCount = 0;

    @Column(name = "dislike_count")
    @Builder.Default
    private Integer dislikeCount = 0;

    /** ====== 시간 정보 ====== */
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /** INSERT 시 자동 처리 */
    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;

        if (likeCount == null) likeCount = 0;
        if (dislikeCount == null) dislikeCount = 0;
    }

    /** UPDATE 시 자동 처리 */
    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /** ====== 편의 메서드: 자식 댓글 추가 ====== */
    public void addChild(ArticleCommentEntity child) {
        children.add(child);
        child.setParent(this);
    }
}
