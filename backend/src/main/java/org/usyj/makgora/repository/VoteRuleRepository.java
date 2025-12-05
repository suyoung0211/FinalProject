package org.usyj.makgora.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.usyj.makgora.entity.VoteEntity;
import org.usyj.makgora.entity.VoteRuleEntity;

@Repository
public interface VoteRuleRepository extends JpaRepository<VoteRuleEntity, Long> {
  Optional<VoteRuleEntity> findByVote(VoteEntity vote);

  
}
