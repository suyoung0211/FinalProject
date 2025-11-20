package org.usyj.makgora.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Vote_Rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoteRuleEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "rule_id")
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "vote_id", nullable = false)
  private Vote vote;

  @Column(name = "rule_type", nullable = false)
  private String ruleType;

  @Column(name = "rule_description")
  private String ruleDescription;

  @Column(name = "created_at")
  private LocalDateTime createdAt = LocalDateTime.now();

  @Column(name = "updated_at")
  private LocalDateTime updatedAt = LocalDateTime.now();
}
