package org.usyj.makgora.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RankingRequest {
    private String rankingType; // POINTS / WINRATE / STREAK
    private Integer page = 0;
    private Integer size = 20; // 기본 페이지 사이즈
}