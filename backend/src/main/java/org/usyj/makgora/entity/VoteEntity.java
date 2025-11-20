package org.usyj.makgora.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

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

    // 연관 관계: 이슈
    @ManyToOne
    @JoinColumn(name = "issue_id", referencedColumnName = "issue_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_vote_issue"))
    private IssueEntity issue;

    @Column(nullable = false, length = 255)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.ONGOING;

    @Column(name = "cancellation_reason", length = 500)
    private String cancellationReason;

    @Column(name = "total_points", nullable = false)
    @Builder.Default
    private Integer totalPoints = 0;

    @Column(name = "total_participants", nullable = false)
    @Builder.Default
    private Integer totalParticipants = 0;

    @Lob
    private String aiProgressSummary;

    @Column(name = "fee_rate", nullable = false)
    @Builder.Default
    private Double feeRate = 0.10;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // ENUM 정의
    public enum Status {
        ONGOING, FINISHED, CANCELLED
    }
}
