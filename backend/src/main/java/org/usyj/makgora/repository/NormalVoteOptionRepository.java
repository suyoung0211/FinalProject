package org.usyj.makgora.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.usyj.makgora.entity.NormalVoteOptionEntity;

public interface NormalVoteOptionRepository extends JpaRepository<NormalVoteOptionEntity, Long> {
}