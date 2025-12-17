package org.usyj.makgora.vote.dto.voteResponse;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class OddsResponse {

    private Integer voteId;
    private Double feeRate;

    // 🔥 옵션 기준 배당 정보
    private List<OptionOdds> options;

    /* ===============================
       🔹 OptionOdds (옵션 기준)
       =============================== */
    @Getter
    @Builder
    public static class OptionOdds {

        private Integer optionId;
        private String optionTitle;

        // 옵션에 몰린 총 포인트
        private Integer optionPool;

        // 옵션 참여자 수
        private Integer participantsCount;

        // 🔥 옵션 기준 현재 배당률
        private Double odds;
    }
}
