package org.usyj.makgora.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.usyj.makgora.entity.RankingEntity;
import org.usyj.makgora.enums.RankingType;

public interface RankingRepository extends JpaRepository<RankingType, Long> {

    List<RankingType> findByRankingType(RankingType type);
    
    RankingEntity findTopByUserUserIdAndRankingType(Long userId, RankingType type);
}