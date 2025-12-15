package org.usyj.makgora.response.vote;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

import org.usyj.makgora.entity.VoteOptionChoiceEntity;

@Getter
@Setter
@Builder
public class VoteResponse {

    private Integer voteId;
    private String title;
    private String status;
    private LocalDateTime endAt;
    private Boolean rewarded;
    private List<OptionResponse> options;

    /* ===============================
       🔹 OptionResponse 구조
       =============================== */
    @Getter
    @Setter
    @Builder
    public static class OptionResponse {
        private Long optionId;
        private String optionTitle;
        private List<ChoiceResponse> choices;
    }

    /* ===============================
       🔹 ChoiceResponse 구조
       =============================== */
    @Getter
    @Setter
    @Builder
    public static class ChoiceResponse {
        private Long choiceId;
        private String choiceText;
        private Integer pointsTotal;
        private Integer participantsCount;
        private Double odds;

        public static ChoiceResponse fromEntity(VoteOptionChoiceEntity e) {
            return ChoiceResponse.builder()
                    .choiceId(e.getId())
                    .choiceText(e.getChoiceText())
                    .pointsTotal(e.getPointsTotal())
                    .participantsCount(e.getParticipantsCount())
                    .odds(e.getOdds())
                    .build();
        }
    }
}
