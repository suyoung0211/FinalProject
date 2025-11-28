package org.usyj.makgora.request.vote;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VoteCreateRequest {

    private Integer issueId; // 어떤 이슈의 투표인지
    private String title;
    private LocalDateTime endAt;

    private List<VoteOptionCreateRequest> options;

    @Getter
    @Setter
    public static class VoteOptionCreateRequest {
        private String optionTitle;
        private LocalDate startDate;
        private LocalDate endDate;
        private List<String> choices; // ex: ["YES", "NO"] or ["A", "B", "C"]
    }
}