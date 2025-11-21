package org.usyj.makgora.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 커뮤니티 게시글 엔티티
 * - 제목/내용/작성자/댓글 연결
 * - 포인트자랑 / 이슈추천 / 일반 카테고리 지원
 */
@Entity
@Table(name = "Community_Posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"user", "comments"})
public class CommunityPostEntity {

    /** 게시글 고유 ID (PK) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "post_id")
    private Long postId;

    /** 작성자 정보 (FK: Users.user_id) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    /** 게시글 제목 */
    @Column(name = "title", length = 255)
    private String title;

    /** 게시글 내용 */
    @Lob
    private String content;

    /** 게시글 유형 (포인트자랑 / 이슈추천 / 일반) */
    @Column(name = "post_type", length = 20)
    private String postType;

    /** 추천 수 */
    @Column(name = "recommendation_count")
    private Integer recommendationCount;

    /** 작성 시각 */
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    /** 수정 시각 */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /** 해당 게시글에 달린 댓글 목록 */
    @Builder.Default
    @OneToMany(mappedBy = "post")
    private List<CommunityCommentEntity> comments = new ArrayList<>();

    /** INSERT 시 기본값 자동 설정 */
    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;

        if (recommendationCount == null) recommendationCount = 0;
        if (postType == null) postType = "일반";
    }

    /** UPDATE 시 시간 자동 반영 */
    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /** 추천 수 증가 */
    public void increaseRecommendation() {
        if (recommendationCount == null) recommendationCount = 0;
        recommendationCount++;
    }
}
