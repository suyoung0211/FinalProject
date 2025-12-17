package org.usyj.makgora.community.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import org.usyj.makgora.article.entity.ArticleCommentEntity;
import org.usyj.makgora.user.entity.UserEntity;

@Entity
@Table(
        name = "comment_reactions",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_comment_user",
                        columnNames = {"comment_id", "user_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentReactionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reaction_id")
    private Integer id;

    /** ====== 🔗 댓글 FK ====== */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_id", nullable = false)
    private ArticleCommentEntity comment;

    /** ====== 🔗 유저 FK ====== */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    /** ====== 반응 값 ======
     *  1  = 좋아요
     * -1  = 싫어요
     */
    @Column(nullable = false)
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
