package org.usyj.makgora.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.usyj.makgora.vote.entity.NormalVoteEntity;

public interface NormalVoteRepository extends JpaRepository<NormalVoteEntity, Integer> {
    long count();
}