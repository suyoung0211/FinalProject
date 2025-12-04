package org.usyj.makgora.request.vote;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class UserVoteCreateRequest {

    private Integer issueId;          // 어떤 이슈에 대한 투표인지
    private String title;             // 투표 제목
    private LocalDateTime endAt;      // 종료 시각

    private List<OptionDto> options;  // 옵션들
    private RuleDto rule;             // (선택) 투표 규칙

    @Data
    public static class OptionDto {
        private String title;         // 예: “승리 팀”
        private List<String> choices; // 예: ["한국", "일본"]
    }

    @Data
    public static class RuleDto {
        private String type;
        private String description;
    }
}
