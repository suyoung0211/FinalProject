package org.usyj.makgora.response.vote;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class VoteResponse {

    private Integer voteId;
    private String title;
    private LocalDateTime endAt;

    // 🆕 추가된 필드들
    private String status;          // VoteEntity.Status
    private Long correctChoiceId;   // 정답 선택지
    private Boolean rewarded;       // 보상 완료 여부
    private Integer totalPool;      // 전체 베팅 금액
    private Integer correctPool;    // 정답 선택지 베팅 금액

    private List<OptionResponse> options;

    @Getter @Setter @Builder
    public static class OptionResponse {

        private Long optionId;
        private String optionTitle;

        // 엔티티와 동일 (LocalDate)
        private LocalDate startDate;
        private LocalDate endDate;

        private List<ChoiceResponse> choices;
    }

    @Getter @Setter @Builder
    public static class ChoiceResponse {

        private Long choiceId;
        private String choiceText;

        // 그대로 엔티티 타입과 일치
        private Integer pointsTotal;
        private Integer participantsCount;
        private Double odds;
    }
}
