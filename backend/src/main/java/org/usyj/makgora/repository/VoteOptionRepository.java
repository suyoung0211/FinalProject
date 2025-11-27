package org.usyj.makgora.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.usyj.makgora.entity.VoteEntity;
import org.usyj.makgora.entity.VoteOptionEntity;

@Repository
public interface VoteOptionRepository extends JpaRepository<VoteOptionEntity, Long> {
    List<VoteOptionEntity> findByVoteId(Long voteId);

    List<VoteOptionEntity> findByVote(VoteEntity vote);

@Query("SELECT o FROM VoteOptionEntity o LEFT JOIN FETCH o.choices WHERE o.vote.id = :voteId")
List<VoteOptionEntity> findAllWithChoicesByVoteId(Long voteId);
}

