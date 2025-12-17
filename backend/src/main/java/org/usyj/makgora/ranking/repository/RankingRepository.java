package org.usyj.makgora.ranking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.usyj.makgora.ranking.entity.RankingEntity;
import org.usyj.makgora.ranking.entity.RankingEntity.RankingType;

import java.util.List;
import java.util.Optional;

@Repository
public interface RankingRepository extends JpaRepository<RankingEntity, Integer> {

    List<RankingEntity> findByUser_Id(Integer userId);

    List<RankingEntity> findByRankingTypeOrderByScoreDesc(RankingType rankingType);

    List<RankingEntity> findTop10ByRankingTypeOrderByScoreDesc(RankingType rankingType);

    Optional<RankingEntity> findByUser_IdAndRankingType(Integer userId, RankingEntity.RankingType type);

}
