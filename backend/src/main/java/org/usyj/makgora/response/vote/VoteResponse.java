package org.usyj.makgora.response.vote;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

import org.usyj.makgora.entity.VoteOptionEntity;
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

    // 🔥 옵션 기준
    private List<OptionResponse> options;

    /* ===============================
       🔹 OptionResponse (옵션 기준)
       =============================== */
    @Getter
    @Setter
    @Builder
    public static class OptionResponse {

        private Integer optionId;
        private String optionTitle;

        // 🔥 옵션 기준 통계/배당
        private Integer participantsCount;
        private Integer pointsTotal;
        private Double odds;

        private List<ChoiceResponse> choices;

        public static OptionResponse fromEntity(VoteOptionEntity opt) {
            return OptionResponse.builder()
                    .optionId(opt.getId())
                    .optionTitle(opt.getOptionTitle())
                    .participantsCount(opt.getParticipantsCount())
                    .pointsTotal(opt.getPointsTotal())
                    .odds(opt.getOdds())
                    .choices(
                        opt.getChoices().stream()
                            .map(ChoiceResponse::fromEntity)
                            .toList()
                    )
                    .build();
        }
    }

    /* ===============================
       🔹 ChoiceResponse (판정/표시용)
       =============================== */
    @Getter
    @Setter
    @Builder
    public static class ChoiceResponse {

        private Integer choiceId;
        private String choiceText;

        public static ChoiceResponse fromEntity(VoteOptionChoiceEntity e) {
            return ChoiceResponse.builder()
                    .choiceId(e.getId())
                    .choiceText(e.getChoiceText())
                    .build();
        }
    }
}
