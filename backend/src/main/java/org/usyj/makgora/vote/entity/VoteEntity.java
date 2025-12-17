package org.usyj.makgora.vote.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.usyj.makgora.issue.entity.IssueEntity;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "Votes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoteEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vote_id")
    private Integer id;

    /** 🔗 이슈 연결 */
    @ManyToOne
    @JoinColumn(name = "issue_id", referencedColumnName = "issue_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_vote_issue"))
    private IssueEntity issue;

    /** 🔗 옵션 목록 */
    @OneToMany(mappedBy = "vote", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<VoteOptionEntity> options;

    /** 🏷 제목 */
    @Column(nullable = false, length = 255)
    private String title;

    /** 🏷 상태 */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.ONGOING;

    /** ❗ 취소 사유 */
    @Column(name = "cancellation_reason", length = 500)
    private String cancellationReason;

    /** 📊 총 베팅 포인트 */
    @Column(name = "total_points", nullable = false)
    @Builder.Default
    private Integer totalPoints = 0;

    /** 👥 참여자 수 */
    @Column(name = "total_participants", nullable = false)
    @Builder.Default
    private Integer totalParticipants = 0;

    /** 🤖 AI 진행 요약 */
    @Lob
    private String aiProgressSummary;

    /** 💰 수수료(수익) */
    @Column(name = "fee_rate", nullable = false)
    @Builder.Default
    private Double feeRate = 0.10;

    /** 📅 종료 시간 */
    @Column(name = "end_at", nullable = false)
    private LocalDateTime endAt;

    /** 🕒 생성/수정 시간 */
    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;


    /* ===================================
       🆕 여기부터 새로 추가되는 핵심 필드
       =================================== */

    /** 💸 보상 지급 완료 여부 */
    @Column(name = "is_rewarded")
    @Builder.Default
    private Boolean rewarded = false;


    /** 📌 상태 ENUM 확장 */
    public enum Status {
        REVIEWING,    // 🆕 이슈화 심사중 (새로 추가)
        ONGOING,      // 진행중 (투표 가능한 상태)
        FINISHED,     // 종료 (투표 마감됨, 정답은 아직)
        RESOLVED,     // 정답 확정됨 (= correctChoice 저장됨)
        REWARDED,     // 정산 완료 (배당까지 처리됨)
        CANCELLED     // 취소됨
    }
}