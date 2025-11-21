package org.usyj.makgora.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Vote_Users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoteUserEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "vote_user_id")
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "vote_id", nullable = false)
  private VoteEntity vote;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private UserEntity user;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "option_id", nullable = false)
  private VoteOptionEntity option;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "choice_id", nullable = false)
  private VoteOptionChoiceEntity choice;

  @Column(name = "points_bet")
  @Builder.Default
  private Integer pointsBet = 0;

  @Column(name = "created_at")
  @Builder.Default
  private LocalDateTime createdAt = LocalDateTime.now();

  @Column(name = "updated_at")
  @Builder.Default
  private LocalDateTime updatedAt = LocalDateTime.now();
}
