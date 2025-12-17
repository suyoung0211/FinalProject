package org.usyj.makgora.community.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.usyj.makgora.user.entity.UserEntity;

/**
 * 커뮤니티 게시글에 달리는 댓글 엔티티
 * - 게시글(Comment) 기반의 토론/대댓글 구조 지원
 * - 게시글: CommunityPostsEntity
 */
@Entity
@Table(name = "Community_Comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"post", "user", "parent", "children"})
public class CommunityCommentEntity {

    /** 댓글 고유 ID (PK) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id")
    private Long commentId;

    /** 어떤 게시글에 달린 댓글인지 (FK: Community_Posts.post_id) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private CommunityPostEntity post;

    /** 댓글 작성자 정보 (FK: Users.user_id) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    /** 부모 댓글 (NULL이면 루트 댓글) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private CommunityCommentEntity parent;

    /** 자식 댓글(대댓글) 목록 */
    @Builder.Default
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true) // 부모 삭제 시 자식도 함께 삭제
    private List<CommunityCommentEntity> children = new ArrayList<>();

    /** 댓글 내용 */
    @Lob
    @Column(nullable = false)
    private String content;

    /** 작성 시각 */
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    /** 수정 시각 */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "like_count")
    private Integer likeCount;

    @Column(name = "dislike_count")
    private Integer dislikeCount;

    /** INSERT 발생 시 자동 시간 설정 */
    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
        if (likeCount == null) likeCount = 0;
        if (dislikeCount == null) dislikeCount = 0;
    }

    /** UPDATE 발생 시 자동 수정시간 업데이트 */
    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /** 
     * 대댓글 추가 편의 메서드 
     * - 양방향 관계 자동 설정
     */
    public void addChild(CommunityCommentEntity child) {
        children.add(child);
        child.setParent(this);
    }
}
