package org.usyj.makgora.normalVote.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.usyj.makgora.normalVote.entity.NormalVoteOptionEntity;

public interface NormalVoteOptionRepository extends JpaRepository<NormalVoteOptionEntity, Integer> {
    List<NormalVoteOptionEntity> findByNormalVote_Id(Integer normalVoteId);
}