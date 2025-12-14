package org.usyj.makgora.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Vote_Options")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoteOptionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "option_id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vote_id", nullable = false)
    private VoteEntity vote;

    @Column(name = "option_title", nullable = false)
    private String optionTitle;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    /* ===============================
       🔥 Option-based Pool Stats
       =============================== */

    // ✅ 옵션에 몰린 총 배팅 포인트
    @Column(name = "points_total", nullable = false)
    @Builder.Default
    private Integer pointsTotal = 0;

    // ✅ 옵션에 참여한 인원 수
    @Column(name = "participants_count", nullable = false)
    @Builder.Default
    private Integer participantsCount = 0;

    // ✅ 현재 배당률(옵션 기준) - 기본 1.0
    @Column(name = "odds", nullable = false)
    @Builder.Default
    private Double odds = 1.0;

    /* ===============================
       Choices (YES/NO/DRAW for verdict)
       =============================== */

    @OneToMany(mappedBy = "option", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<VoteOptionChoiceEntity> choices = new ArrayList<>();

    // ✅ 해당 옵션의 정답 choice
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "correct_choice_id",
        foreignKey = @ForeignKey(name = "fk_option_correct_choice")
    )
    private VoteOptionChoiceEntity correctChoice;

    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private Boolean isDeleted = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = (this.createdAt != null) ? this.createdAt : now;
        this.updatedAt = (this.updatedAt != null) ? this.updatedAt : now;

        if (this.pointsTotal == null) this.pointsTotal = 0;
        if (this.participantsCount == null) this.participantsCount = 0;
        if (this.odds == null) this.odds = 1.0;
        if (this.isDeleted == null) this.isDeleted = false;
        if (this.choices == null) this.choices = new ArrayList<>();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
