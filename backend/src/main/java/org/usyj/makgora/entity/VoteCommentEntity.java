package org.usyj.makgora.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 이슈 상세 페이지에서 사용하는 댓글 엔티티
 * - 이슈 기반 토론/의견 시스템
 * - 대댓글(parent-child) 구조 지원
 */
@Entity
@Table(name = "Comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"issue", "user", "parent", "children"})
public class VoteCommentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id")
    private Long commentId;

    /** 연결된 이슈 댓글 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issue_id", nullable = true)
    private IssueEntity issue;

    /** AI Vote 댓글 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vote_id", nullable = true)
    private VoteEntity vote;

    /** NormalVote는 제거됨 */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private VoteCommentEntity parent;

    @Column(name = "like_count")
    private Integer likeCount;

    @Column(name = "dislike_count")
    private Integer dislikeCount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "choice_id")
    private VoteOptionChoiceEntity choice;

    @Builder.Default
    @OneToMany(mappedBy = "parent")
    private List<VoteCommentEntity> children = new ArrayList<>();

    @Column(name = "is_deleted")
    @Builder.Default
    private Boolean isDeleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Lob
    @Column(nullable = false)
    private String content;

    @Column(name = "position")
    private String position;

    @Column(name = "user_position")
    private String userPosition;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
        if (position == null) position = "중립";
        if (likeCount == null) likeCount = 0;
        if (dislikeCount == null) dislikeCount = 0;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void softDelete() {
        this.isDeleted = true;
        this.content = "[삭제된 댓글입니다]";
        this.deletedAt = LocalDateTime.now();
    }

    public void addChild(VoteCommentEntity child) {
        children.add(child);
        child.setParent(this);
    }
}
