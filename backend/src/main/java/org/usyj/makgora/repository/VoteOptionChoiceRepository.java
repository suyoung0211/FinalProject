package org.usyj.makgora.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.usyj.makgora.entity.VoteOptionChoiceEntity;

@Repository
public interface VoteOptionChoiceRepository extends JpaRepository<VoteOptionChoiceEntity, Integer> {
  List<VoteOptionChoiceEntity> findByOptionId(Integer optionId);

  List<VoteOptionChoiceEntity> findByOptionIdOrderByPointsTotalDesc(Integer optionId);

}