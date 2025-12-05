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

    private List<OptionUpdateDto> options;  // 전체 옵션 목록 다시 입력

    @Data
    public static class OptionUpdateDto {
        private Long optionId;           // 기존 optionId (신규 옵션이면 null)
        private String optionTitle;      
        private List<ChoiceUpdateDto> choices;
    }

    @Data
    public static class ChoiceUpdateDto {
        private Long choiceId;           // 기존 choiceId (신규 선택지는 null)
        private String choiceText;
    }
}