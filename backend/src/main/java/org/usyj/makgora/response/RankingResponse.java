package org.usyj.makgora.response;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter

public class RankingResponse {
    private Long rankingId;
    private Integer userId;
    private String nickname;
    private String rankingType;
    private Integer rank;
    private Integer score;
    private String updatedAt;
}