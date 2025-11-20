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
public class CommentsEntity {

    /** 댓글 고유 ID (PK) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id")
    private Long commentId;

    /** 연결된 이슈 ID (FK: Issues.issue_id) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issue_id", nullable = false)
    private IssueEntity issue;

    /** 댓글 작성자 (FK: Users.user_id) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UsersEntity user;

    /** 부모 댓글 (대댓글 구조: NULL이면 루트 댓글) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private CommentsEntity parent;

    /** 자식 댓글(대댓글) 리스트 */
    @Builder.Default
    @OneToMany(mappedBy = "parent")
    private List<CommentsEntity> children = new ArrayList<>();

    /** 댓글 내용 */
    @Lob
    @Column(nullable = false)
    private String content;

    /** 댓글의 의견 표기 (찬성/반대/중립) */
    @Column(name = "position", length = 10)
    private String position;

    /** 댓글 작성자의 포지션 (AI 또는 Vote_Users와 연동 가능) */
    @Column(name = "user_position", length = 50)
    private String userPosition;

    /** 작성 시각 */
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    /** 수정 시각 */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /** INSERT 시 자동 시간/초기값 설정 */
    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
        if (position == null) position = "중립";
    }

    /** UPDATE 시 수정 시간 자동 반영 */
    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * 대댓글 추가 편의 메서드
     * - 부모-자식 관계를 양방향으로 자동 연결
     */
    public void addChild(CommentsEntity child) {
        children.add(child);
        child.setParent(this);
    }
}
