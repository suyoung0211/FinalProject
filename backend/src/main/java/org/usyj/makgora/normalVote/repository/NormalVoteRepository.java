package org.usyj.makgora.normalVote.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.usyj.makgora.normalVote.entity.NormalVoteEntity;

public interface NormalVoteRepository extends JpaRepository<NormalVoteEntity, Integer> {
    long count();
}