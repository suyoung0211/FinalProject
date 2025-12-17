package org.usyj.makgora.normalVote.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.usyj.makgora.normalVote.entity.NormalVoteChoiceEntity;

public interface NormalVoteChoiceRepository extends JpaRepository<NormalVoteChoiceEntity, Integer> {
}