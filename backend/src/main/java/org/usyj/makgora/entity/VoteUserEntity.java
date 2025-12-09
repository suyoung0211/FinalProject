package org.usyj.makgora.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "Vote_Users",
    uniqueConstraints = {
        // ⭐ AI 투표: 유저는 같은 vote_id에 대해 1번만 참여 가능
        @UniqueConstraint(
                name = "unique_ai_vote_user",
                columnNames = {"vote_id", "user_id"}
        ),
        // ⭐ Normal 투표: 유저는 같은 normal_vote_id에 대해 1번만 참여 가능
        @UniqueConstraint(
                name = "unique_normal_vote_user",
                columnNames = {"normal_vote_id", "user_id"}
        )
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

    // AI Vote
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vote_id", nullable = true)
    private VoteEntity vote;

    // Normal Vote
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "normal_vote_id", nullable = true)
    private NormalVoteEntity normalVote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    // === AI Vote 옵션/선택지 ===
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "option_id")
    private VoteOptionEntity option;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "choice_id")
    private VoteOptionChoiceEntity choice;

    // === Normal Vote 옵션/선택지 ===
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "normal_choice_id")
    private NormalVoteChoiceEntity normalChoice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "normal_option_id")
    private NormalVoteOptionEntity normalOption;

    @Column(name = "points_bet")
    @Builder.Default
    private Integer pointsBet = 0;

    @Column(name = "is_cancelled")
    @Builder.Default
    private Boolean isCancelled = false;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
