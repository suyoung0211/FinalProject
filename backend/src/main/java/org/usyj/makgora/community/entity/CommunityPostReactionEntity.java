package org.usyj.makgora.community.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import org.usyj.makgora.user.entity.UserEntity;

/**
 * 커뮤니티 게시글 반응 엔티티
 * - 어떤 유저가 어떤 게시글에 어떤 반응(추천/비추천)을 했는지 기록
 * - reactionValue: 1 = 추천(좋아요), -1 = 비추천(싫어요)
 * - 한 유저는 한 게시글에 대해 단 1개의 반응만 가능
 */
@Entity
@Table(
    name = "Community_Post_Reactions",
    uniqueConstraints = {
        @UniqueConstraint(name = "unique_post_reaction_user", columnNames = {"post_id", "user_id"}
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"post", "user"})
public class CommunityPostReactionEntity {

    /** 반응 고유 ID (PK) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reaction_id")
    private Long reactionId;

    /** 어떤 게시글에 대한 반응인지 (FK: Community_Posts.post_id) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private CommunityPostEntity post;

    /** 반응을 남긴 유저 정보 (FK: Users.user_id) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    /**
     * 반응 값
     *  1  = 추천(좋아요)
     * -1  = 비추천(싫어요)
     */
    @Column(name = "reaction_value", nullable = false)
    private Integer reactionValue;

    /** 생성 시각 */
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    /** 수정 시각 */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /** INSERT 발생 시 시간 자동 설정 */
    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
    }

    /** UPDATE 발생 시 시간 자동 반영 */
    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
