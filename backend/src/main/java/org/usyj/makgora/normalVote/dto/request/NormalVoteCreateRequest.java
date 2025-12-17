package org.usyj.makgora.normalVote.dto.request;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class NormalVoteCreateRequest {

    private String title;               // 투표 제목
    private String description;         // 설명
    private LocalDateTime endAt;        // 종료 시각

    private List<OptionDto> options;    // 옵션 그룹 목록
    
    private String category;  
    @Data
    public static class OptionDto {
        private String optionTitle;     // 그룹명 (예: 예측, 승리팀)
        private List<String> choices;   // 선택지 목록 (예: ["YES", "NO"])
    }
}