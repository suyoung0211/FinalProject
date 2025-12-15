package org.usyj.makgora.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "normal_vote_status_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NormalVoteStatusHistoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "normal_status_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "normal_vote_id", nullable = false)
    private NormalVoteEntity normalVote;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(name = "status_date", nullable = false)
    private LocalDateTime statusDate;

        /** 이력 생성 시각 */
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public enum Status {
        ONGOING,
        FINISHED,
        CANCELLED
    }

    /** INSERT 시 자동 시간 설정 */
    @PrePersist
    public void prePersist() {
        if (statusDate == null) statusDate = LocalDateTime.now();
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
