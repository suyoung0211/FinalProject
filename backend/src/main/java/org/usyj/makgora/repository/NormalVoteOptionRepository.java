package org.usyj.makgora.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.usyj.makgora.vote.entity.NormalVoteOptionEntity;

public interface NormalVoteOptionRepository extends JpaRepository<NormalVoteOptionEntity, Integer> {
    List<NormalVoteOptionEntity> findByNormalVote_Id(Integer normalVoteId);
}