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
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "option_id", nullable = false)
  private VoteOptionEntity option;

  @Column(name = "choice_text", nullable = false)
  private String choiceText;

  @Column(name = "points_total")
  @Builder.Default
  private Integer pointsTotal = 0;

  @Column(name = "participants_count")
  @Builder.Default
  private Integer participantsCount = 0;

  @Column(name = "created_at")
  @Builder.Default
  private LocalDateTime createdAt = LocalDateTime.now();

  @Column(name = "updated_at")
  @Builder.Default
  private LocalDateTime updatedAt = LocalDateTime.now();

  @Column(name = "odds")
  private Double odds;

  /* =========================
     🆕 정답 여부 (핵심)
     ========================= */
  @Column(name = "is_correct", nullable = false)
  @Builder.Default
  private Boolean isCorrect = false;
}
