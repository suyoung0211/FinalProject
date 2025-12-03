package org.usyj.makgora.response.vote;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.usyj.makgora.entity.VoteOptionChoiceEntity;

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

    private String status;
    private Long correctChoiceId;
    private Boolean rewarded;
    private Integer totalPool;
    private Integer correctPool;

    private List<OptionResponse> options;

    // 옵션 응답 객체
    @Getter @Setter @Builder
    public static class OptionResponse {
        private Long optionId;
        private String optionTitle;
        private LocalDate startDate;
        private LocalDate endDate;
        private List<ChoiceResponse> choices;
    }

    // 선택지 응답 객체
    @Getter @Setter @Builder
    public static class ChoiceResponse {
        private Long choiceId;
        private String choiceText;
        private Integer pointsTotal;
        private Integer participantsCount;
        private Double odds;

        // 🔥 여기! fromEntity()는 ChoiceResponse 내부에 있어야 한다
        public static ChoiceResponse fromEntity(VoteOptionChoiceEntity ch) {
            return ChoiceResponse.builder()
                    .choiceId(ch.getId())
                    .choiceText(ch.getChoiceText())
                    .pointsTotal(ch.getPointsTotal())
                    .participantsCount(ch.getParticipantsCount())
                    .odds(ch.getOdds())
                    .build();
        }
    }
}
