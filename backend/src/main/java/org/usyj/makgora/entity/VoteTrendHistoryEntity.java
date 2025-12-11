package org.usyj.makgora.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vote_trend_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoteTrendHistoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "trend_id")
    private Long id;

    /** 📌 어떤 투표(AI 또는 NormalVote 포함)인지 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vote_id", nullable = false)
    private VoteEntity vote;

    /** 📌 어떤 선택지(YES / NO 등)에 대한 기록인지 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "choice_id", nullable = false)
    private VoteOptionChoiceEntity choice;

    /** 📊 시점별 퍼센트 (0 ~ 100 사이 값) */
    @Column(name = "percent", nullable = false)
    private Double percent;

    /** 💰 해당 시점의 총 베팅 포인트 or 참여수 */
    @Column(name = "total_points", nullable = false)
    private Integer totalPoints;

    /** 🕒 기록된 시간 */
    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;
}
