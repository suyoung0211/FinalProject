package org.usyj.makgora.repository;

import org.usyj.makgora.entity.RankingEntity;
import org.usyj.makgora.entity.RankingEntity.RankingType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RankingRepository extends JpaRepository<RankingEntity, Integer> {

    List<RankingEntity> findByUser_Id(Integer userId);

    List<RankingEntity> findByRankingTypeOrderByScoreDesc(RankingType rankingType);

    List<RankingEntity> findTop10ByRankingTypeOrderByScoreDesc(RankingType rankingType);
}
