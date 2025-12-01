package org.usyj.makgora.response.vote;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class OddsResponse {

    private Integer voteId;
    private Integer totalPool;

    private List<ChoiceOdds> choices;

    @Getter
    @Setter
    @Builder
    public static class ChoiceOdds {
        private Long choiceId;
        private String choiceText;
        private Integer pointsTotal;
        private Integer participantsCount;
        private Double odds;  // null이면 아직 베팅이 없는 선택지
    }
}
