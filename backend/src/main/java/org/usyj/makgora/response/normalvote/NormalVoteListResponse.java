package org.usyj.makgora.response.normalvote;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class NormalVoteListResponse {

    private List<NormalVoteListItemResponse> votes; // 목록
    private int totalCount;                         // 전체 개수
    
}