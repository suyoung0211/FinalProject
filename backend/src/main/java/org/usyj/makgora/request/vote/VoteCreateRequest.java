package org.usyj.makgora.request.vote;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class VoteCreateRequest {

    private String title;    // 투표 제목
    private LocalDateTime endAt;

    private List<VoteOptionRequest> options;

    @Getter @Setter
    public static class VoteOptionRequest {
        private String optionTitle;
        private LocalDate startDate;
        private LocalDate endDate;
        private List<String> choices;   // YES / NO / DRAW 등
    }
}
