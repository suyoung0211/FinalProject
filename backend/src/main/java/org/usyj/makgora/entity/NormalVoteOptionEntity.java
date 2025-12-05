package org.usyj.makgora.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "Normal_Vote_Options")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NormalVoteOptionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "normal_option_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "normal_vote_id", nullable = false)
    private NormalVoteEntity normalVote;

    /** 옵션 그룹명: 예) “예측”, “승리 팀” */
    @Column(name = "option_title", nullable = false)
    private String optionTitle;

    @OneToMany(mappedBy = "normalOption", cascade = CascadeType.ALL)
    private List<NormalVoteChoiceEntity> choices;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "is_deleted")
    @Builder.Default
    private Boolean isDeleted = false;
}
