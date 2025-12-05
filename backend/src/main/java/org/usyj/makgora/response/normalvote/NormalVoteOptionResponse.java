package org.usyj.makgora.response.normalvote;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class NormalVoteOptionResponse {

    private Long optionId;       // 옵션 ID
    private String title;        // 옵션 제목 (예: "승리 팀")

    private List<NormalVoteChoiceResponse> choices; // YES/NO 또는 여러 선택지
}