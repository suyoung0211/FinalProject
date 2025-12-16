package org.usyj.makgora.response.voteDetails;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class VoteTrendResponse {

    private Integer voteId;
    private List<TrendItemResponse> trends;
}
