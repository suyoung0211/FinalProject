package org.usyj.makgora.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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
public class CommunityCommentsEntity {

    /** 댓글 고유 ID (PK) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id")
    private Long commentId;

    /** 어떤 게시글에 달린 댓글인지 (FK: Community_Posts.post_id) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private CommunityPostsEntity post;

    /** 댓글 작성자 정보 (FK: Users.user_id) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UsersEntity user;

    /** 부모 댓글 (NULL이면 루트 댓글) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private CommunityCommentsEntity parent;

    /** 자식 댓글(대댓글) 목록 */
    @Builder.Default
    @OneToMany(mappedBy = "parent")
    private List<CommunityCommentsEntity> children = new ArrayList<>();

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

    /** INSERT 발생 시 자동 시간 설정 */
    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
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
    public void addChild(CommunityCommentsEntity child) {
        children.add(child);
        child.setParent(this);
    }
}
