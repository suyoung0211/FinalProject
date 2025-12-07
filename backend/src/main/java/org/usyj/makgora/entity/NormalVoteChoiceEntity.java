package org.usyj.makgora.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Normal_Vote_Choices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NormalVoteChoiceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "normal_choice_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "normal_option_id", nullable = false)
    private NormalVoteOptionEntity normalOption;

    /** 선택지 이름: YES / NO 또는 특정 팀 이름 */
    @Column(name = "choice_text", nullable = false)
    private String choiceText;

    @Column(name = "participants_count", nullable = false)
    @Builder.Default
    private Integer participantsCount = 0;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
