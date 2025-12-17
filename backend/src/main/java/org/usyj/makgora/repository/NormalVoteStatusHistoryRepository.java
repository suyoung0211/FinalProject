package org.usyj.makgora.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.usyj.makgora.vote.entity.NormalVoteStatusHistoryEntity;

public interface NormalVoteStatusHistoryRepository extends JpaRepository<NormalVoteStatusHistoryEntity, Long> {

}