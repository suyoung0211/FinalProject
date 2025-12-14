package org.usyj.makgora.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "Vote_Option_Choices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoteOptionChoiceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "choice_id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "option_id", nullable = false)
    private VoteOptionEntity option;

    @Column(name = "choice_text", nullable = false)
    private String choiceText;

    // ✅ 정답 여부 (정산 시 true)
    @Column(name = "is_correct", nullable = false)
    @Builder.Default
    private Boolean isCorrect = false;

    /* ===============================
       🔥 통계 필드 (필수)
       =============================== */

    // 선택지에 베팅된 총 포인트
    @Column(name = "points_total", nullable = false)
    @Builder.Default
    private Integer pointsTotal = 0;

    // 선택지 참여자 수
    @Column(name = "participants_count", nullable = false)
    @Builder.Default
    private Integer participantsCount = 0;

    /* ===============================
       메타 정보
       =============================== */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = (this.createdAt != null) ? this.createdAt : now;
        this.updatedAt = (this.updatedAt != null) ? this.updatedAt : now;

        if (pointsTotal == null) pointsTotal = 0;
        if (participantsCount == null) participantsCount = 0;
        if (isCorrect == null) isCorrect = false;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }


}
