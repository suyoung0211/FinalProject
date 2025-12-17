package org.usyj.makgora.vote.dto.voteDetailResponse;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class VoteTrendResponse {

    private Integer voteId;
    private List<TrendItemResponse> trends;
}
