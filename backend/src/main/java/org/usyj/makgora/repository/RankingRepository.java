package org.usyj.makgora.repository;

import org.usyj.makgora.entity.RankingEntity;
import org.usyj.makgora.entity.RankingEntity.RankingType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RankingRepository extends JpaRepository<RankingEntity, Integer> {

    // 특정 사용자 랭킹 조회
    List<RankingEntity> findByUserId(Integer userId);

    // 특정 랭킹 타입으로 모든 랭킹 조회, 점수 내림차순 정렬
    List<RankingEntity> findByRankingTypeOrderByScoreDesc(RankingType rankingType);

    // 특정 랭킹 타입에서 상위 N개 조회
    List<RankingEntity> findTop10ByRankingTypeOrderByScoreDesc(RankingType rankingType);
}
