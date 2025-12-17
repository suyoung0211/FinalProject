package org.usyj.makgora.vote.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.usyj.makgora.user.entity.UserEntity;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "Normal_Votes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NormalVoteEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "normal_vote_id")
    private Long id;

    /** 투표 생성 유저 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    /** 제목 */
    @Column(nullable = false, length = 255)
    private String title;

    /** 설명 */
    @Lob
    private String description;

    /** 👥 참여자 수 */
    @Column(name = "total_participants", nullable = false)
    @Builder.Default
    private Integer totalParticipants = 0;

    /** 종료 시각 */
    @Column(name = "end_at", nullable = false)
    private LocalDateTime endAt;

    /** 상태 */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.ONGOING;

    /** 생성/수정 시간 */
    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    private NormalCategory category;

    /** 옵션 목록 */
    @OneToMany(mappedBy = "normalVote", cascade = CascadeType.ALL)
    private List<NormalVoteOptionEntity> options;

    public enum Status {
        ONGOING,
        FINISHED,
        CANCELLED
    }

    public enum NormalCategory {
    POLITICS, BUSINESS, SPORTS, TECHNOLOGY, ENTERTAINMENT, CRYPTO
}
}
