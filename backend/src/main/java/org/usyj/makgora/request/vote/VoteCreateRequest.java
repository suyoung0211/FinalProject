package org.usyj.makgora.request.vote;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VoteCreateRequest {
    private String title;
    private LocalDateTime endAt;
    private List<VoteOptionRequest> options;

    @Getter @Setter
    public static class VoteOptionRequest {
        private String optionTitle;
        private LocalDate startDate;
        private LocalDate endDate;
        private List<String> choices;  // ["YES", "NO"]
        
    }
}
