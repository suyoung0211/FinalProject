package org.usyj.makgora.response.voteDetails;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NormalVoteResultResponse {

    private Integer normalVoteId;
    private String title;
    private String status;

    private Integer totalParticipants;
    private List<OptionResult> options;

    @Data
    @Builder
    public static class OptionResult {
        private Long optionId;
        private String title;
        private Integer participants;
        private Double percent;
    }
}
