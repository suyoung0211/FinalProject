package org.usyj.makgora.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.usyj.makgora.vote.entity.NormalVoteChoiceEntity;

public interface NormalVoteChoiceRepository extends JpaRepository<NormalVoteChoiceEntity, Integer> {
}