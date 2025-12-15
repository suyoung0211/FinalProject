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

    /* ===============================
       AI Vote / Normal Vote (둘 중 하나)
       =============================== */

    // AI Vote
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vote_id")
    private VoteEntity vote;

    // Normal Vote
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "normal_vote_id")
    private NormalVoteEntity normalVote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    /* ===============================
       ✅ AI Vote: 옵션(돈/배당) + 선택지(판정)
       =============================== */

    // 🔥 배팅 대상(돈/배당 풀) = Option
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "option_id")
    private VoteOptionEntity option;

    // 🔥 판정용(YES/NO/DRAW) = Choice (없을 수도 있음)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "choice_id")
    private VoteOptionChoiceEntity choice;

    /* ===============================
       ✅ Normal Vote: 옵션/선택지
       =============================== */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "normal_option_id")
    private NormalVoteOptionEntity normalOption;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "normal_choice_id")
    private NormalVoteChoiceEntity normalChoice;

    /* ===============================
       Betting / Settlement
       =============================== */

    @Column(name = "points_bet", nullable = false)
    @Builder.Default
    private Integer pointsBet = 0;

    // ✅ AI Vote 전용: 베팅 시점(스냅샷) 옵션 배당률
    @Column(name = "odds_at_bet")
    private Double oddsAtBet;

    // ✅ 정산 결과 저장(추천)
    @Column(name = "reward_points")
    private Integer rewardPoints;

    @Column(name = "is_win")
    private Boolean isWin;

    @Column(name = "is_cancelled", nullable = false)
    @Builder.Default
    private Boolean isCancelled = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = (this.createdAt != null) ? this.createdAt : now;
        this.updatedAt = (this.updatedAt != null) ? this.updatedAt : now;
        if (this.pointsBet == null) this.pointsBet = 0;
        if (this.isCancelled == null) this.isCancelled = false;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
