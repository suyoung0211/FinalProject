package org.usyj.makgora.vote.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.usyj.makgora.vote.entity.VoteEntity;
import org.usyj.makgora.vote.entity.VoteRuleEntity;

@Repository
public interface VoteRuleRepository extends JpaRepository<VoteRuleEntity, Long> {
  Optional<VoteRuleEntity> findByVote(VoteEntity vote);

  
}
