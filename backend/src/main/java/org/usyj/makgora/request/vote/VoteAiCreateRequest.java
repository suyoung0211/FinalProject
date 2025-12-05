// src/main/java/org/usyj/makgora/request/vote/VoteAiCreateRequest.java
package org.usyj.makgora.request.vote;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class VoteAiCreateRequest {

    private Integer issueId;
    private String question;
    private LocalDateTime endAt;
    private String initialStatus;  // 기본 REVIEWING
    private Double feeRate;

    private List<OptionDto> options;
    private RuleDto rule;

    @Data
    public static class OptionDto {
        private String title;
        private List<String> choices; // YES / NO (/ DRAW)
    }

    @Data
    public static class RuleDto {
        private String type;
        private String description;
    }
}
