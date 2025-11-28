package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.RankingEntity;
import org.usyj.makgora.entity.RankingEntity.RankingType;
import org.usyj.makgora.entity.UserEntity;
import org.usyj.makgora.repository.RankingRepository;
import org.usyj.makgora.repository.UserRepository;
import org.usyj.makgora.response.RankingResponse;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RankingService {

    private final RankingRepository rankingRepo;
    private final UserRepository userRepo;

    /** 🔥 내 랭킹 조회 */
    public List<RankingResponse> getMyRanking(Integer userId) {
        return rankingRepo.findByUser_Id(userId)
                .stream()
                .map(RankingResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /** 🔥 랭킹 타입별 전체 랭킹 조회 */
    public List<RankingResponse> getRankingByType(RankingType type) {
        return rankingRepo.findByRankingTypeOrderByScoreDesc(type)
                .stream()
                .map(RankingResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /** 🔥 랭킹 타입별 TOP 10 */
    public List<RankingResponse> getTop10(RankingType type) {
        return rankingRepo.findTop10ByRankingTypeOrderByScoreDesc(type)
                .stream()
                .map(RankingResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /** 🔥 랭킹 점수 업데이트 (게임/포인트 변동 시 사용할 함수) */
    @Transactional
    public void updateRanking(Integer userId, RankingType type, int addScore) {

        UserEntity user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        RankingEntity ranking = rankingRepo.findByUser_Id(userId).stream()
                .filter(r -> r.getRankingType() == type)
                .findFirst()
                .orElse(RankingEntity.builder()
                        .user(user)
                        .rankingType(type)
                        .ranking(0)
                        .score(0)
                        .build());

        ranking.setScore(ranking.getScore() + addScore);

        rankingRepo.save(ranking);
    }
}