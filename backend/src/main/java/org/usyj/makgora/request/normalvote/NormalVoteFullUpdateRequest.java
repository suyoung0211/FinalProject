package org.usyj.makgora.request.normalvote;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class NormalVoteFullUpdateRequest {

    private String title;
    private String description;
    private String category;
    private LocalDateTime endAt;

    private List<OptionUpdateDto> options;      // 수정 or 신규만 포함
    private List<Integer> deletedOptionIds;        // 명시적 삭제
    private List<Integer> deletedChoiceIds;        // 명시적 삭제

    @Data
    public static class OptionUpdateDto {
        private Integer optionId;  // null → 신규 추가
        private String optionTitle;

        private List<ChoiceUpdateDto> choices;  // 수정 or 신규만 포함
    }

    @Data
    public static class ChoiceUpdateDto {
        private Integer choiceId; // null → 신규 추가
        private String choiceText;
    }
}