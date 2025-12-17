package org.usyj.makgora.repository;

import org.usyj.makgora.vote.entity.VoteEntity;
import org.usyj.makgora.vote.entity.VoteStatusHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

// 투표 상태 변경 이력
public interface VotesStatusHistoryRepository extends JpaRepository<VoteStatusHistoryEntity, Long> {

    // 특정 투표의 상태 이력을 시간순으로 조회
    List<VoteStatusHistoryEntity> findByVoteOrderByStatusDateAsc(VoteEntity vote);
}
