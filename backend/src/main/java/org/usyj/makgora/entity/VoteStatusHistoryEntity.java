package org.usyj.makgora.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 투표 상태 변경 이력 엔티티
 * - 진행중 → 마감 → 결과확정 → 보상분배 등 단계별 상태 기록
 * - VoteEntity와 연결되어 투표의 흐름을 추적하는 용도
 */
@Entity
@Table(name = "Votes_Status_History")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoteStatusHistoryEntity {

    /** 상태 기록 고유 ID (PK) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "status_id")
    private Long statusId;

    /** 어떤 투표의 상태 이력인지 (FK: Votes.vote_id) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vote_id", nullable = false)
    private VoteEntity vote;

    /** 상태 정보 (진행중/마감/결과확정/보상분배) */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private Status status;   // ← Enum 타입으로 변경

    /** 상태 변경 시각 */
    @Column(name = "status_date", nullable = false)
    private LocalDateTime statusDate;

    /** 이력 생성 시각 */
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    /** INSERT 시 자동 시간 설정 */
    @PrePersist
    public void prePersist() {
        if (statusDate == null) statusDate = LocalDateTime.now();
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    public enum Status {
        ONGOING,      // 진행중 (투표 가능한 상태)
        FINISHED,     // 종료 (투표 마감됨, 정답은 아직)
        RESOLVED,     // 정답 확정됨 (= correctChoice 저장됨)
        REWARDED,     // 정산 완료 (배당까지 처리됨)
        CANCELLED     // 취소됨
    }
}
