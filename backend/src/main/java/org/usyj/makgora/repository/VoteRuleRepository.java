package org.usyj.makgora.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.usyj.makgora.entity.VoteRuleEntity;

@Repository
public interface VoteRuleRepository extends JpaRepository<VoteRuleEntity, Long> {
  List<VoteRuleEntity> findByVoteId(Long voteId);

  
}
