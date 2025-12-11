package org.usyj.makgora.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.usyj.makgora.entity.VoteTrendHistoryEntity;

/**
 * 📊 VoteTrendHistoryRepository
 * YES/NO 등 선택지의 퍼센트 변동 그래프 조회
 */
public interface VoteTrendHistoryRepository extends JpaRepository<VoteTrendHistoryEntity, Long> {

    List<VoteTrendHistoryEntity> findByVoteId(Integer voteId);
}
