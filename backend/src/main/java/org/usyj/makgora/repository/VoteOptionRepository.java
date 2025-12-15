package org.usyj.makgora.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.usyj.makgora.entity.VoteEntity;
import org.usyj.makgora.entity.VoteOptionEntity;

@Repository
public interface VoteOptionRepository extends JpaRepository<VoteOptionEntity, Integer> {
    List<VoteOptionEntity> findByVoteId(Integer voteId);

    List<VoteOptionEntity> findByVote(VoteEntity vote);

@Query("SELECT o FROM VoteOptionEntity o LEFT JOIN FETCH o.choices WHERE o.vote.id = :voteId")
List<VoteOptionEntity> findAllWithChoicesByVoteId(Long voteId);

@Query("""
        select distinct o
        from VoteOptionEntity o
        left join fetch o.choices c
        where o.vote.id = :voteId
    """)
    List<VoteOptionEntity> findByVoteIdWithChoices(@Param("voteId") Integer voteId);

}

