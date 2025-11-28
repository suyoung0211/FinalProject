package org.usyj.makgora.response;

import lombok.Builder;
import lombok.Getter;
import org.usyj.makgora.entity.RankingEntity;

@Getter
@Builder
public class RankingResponse {
    private Long rankingId;
    private Integer userId;
    private String nickname;
    private String rankingType;
    private Integer rank;
    private Integer score;
    private String updatedAt;

    public static RankingResponse fromEntity(RankingEntity e) {
        return RankingResponse.builder()
                .rankingId(e.getId().longValue())
                .userId(e.getUser().getId())
                .nickname(e.getUser().getNickname())
                .rankingType(e.getRankingType().name())
                .rank(e.getRanking())
                .score(e.getScore())
                .updatedAt(e.getUpdatedAt() != null ? e.getUpdatedAt().toString() : null)
                .build();
    }
}