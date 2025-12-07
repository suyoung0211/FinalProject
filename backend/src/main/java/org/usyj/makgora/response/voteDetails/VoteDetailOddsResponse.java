package org.usyj.makgora.response.voteDetails;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data @Builder
public class VoteDetailOddsResponse {

    private Integer voteId;

    private List<OddsItem> odds;

    @Data @Builder
    public static class OddsItem {
        private Integer choiceId;
        private String text;
        private Double odds;        // 배당
    }
}