package org.usyj.makgora.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.usyj.makgora.entity.NormalVoteOptionEntity;

public interface NormalVoteOptionRepository extends JpaRepository<NormalVoteOptionEntity, Long> {
    List<NormalVoteOptionEntity> findByNormalVote_Id(Long normalVoteId);
}