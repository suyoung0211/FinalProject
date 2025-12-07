package org.usyj.makgora.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "Vote_Users",
    uniqueConstraints = {
        // 옵션별 중복 투표 방지: 하나의 사용자가 하나의 옵션에 대해 1회만 투표 가능
        @UniqueConstraint(name = "unique_ai_vote_user_option",
                  columnNames = {"vote_id", "user_id", "option_id"}),

@UniqueConstraint(name = "unique_normal_vote_user_option",
                  columnNames = {"normal_vote_id", "user_id"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoteUserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vote_user_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vote_id", nullable = true)
    private VoteEntity vote;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "normal_vote_id", nullable = true)
    private NormalVoteEntity normalVote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "option_id", nullable = false)
    private VoteOptionEntity option;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "choice_id", nullable = false)
    private VoteOptionChoiceEntity choice;

    @Column(name = "points_bet")
    @Builder.Default
    private Integer pointsBet = 0;

    @Column(name = "is_cancelled")
    @Builder.Default
    private Boolean isCancelled = false; // 투표 취소 여부

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
