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
@Table(name = "community_posts")   // 실제 테이블명이랑 맞춰줘!
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"user", "comments", "files"})
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
    @Builder.Default
    @Column(name = "recommendation_count", nullable = false)
    private Integer recommendationCount = 0;

    /** 비추천 수 */
    @Builder.Default
    @Column(name = "dislike_count", nullable = false)
    private Integer dislikeCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private int commentCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private int aiSystemScore = 0;

    @Column(name = "view_count")
    @Builder.Default
    private Integer viewCount = 0;

    /** 작성 시각 */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** 수정 시각 */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /** 해당 게시글에 달린 댓글 목록 */
    @Builder.Default
    @OneToMany(mappedBy = "post")
    private List<CommunityCommentEntity> comments = new ArrayList<>();

    /** 해당 게시글에 첨부된 파일 목록 */
    @Builder.Default
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CommunityPostFileEntity> files = new ArrayList<>();

    /** INSERT 시 기본값 자동 설정 */
    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
        
        if (recommendationCount == null) recommendationCount = 0;
        if (viewCount == null) viewCount = 0;
        
        if (postType == null) postType = "free";
        if (recommendationCount == null) recommendationCount = 0;
        if (dislikeCount == null) dislikeCount = 0;
    }
    
    /** DB에서 조회 후 NULL 값을 0으로 변환 */
    @PostLoad
    public void postLoad() {
        if (recommendationCount == null) recommendationCount = 0;
        if (dislikeCount == null) dislikeCount = 0;
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

    /** 비추천 수 증가 */
    public void increaseDislike() {
        if (dislikeCount == null) dislikeCount = 0;
        dislikeCount++;
    }
}
