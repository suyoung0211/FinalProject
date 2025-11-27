package org.usyj.makgora.request.vote;

import java.time.LocalDateTime;
import java.util.List;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VoteCreateRequest {

    private String title;   // 투표 제목

    private VoteType type;  // YESNO or MULTI

    private List<String> options; // MULTI 옵션일 때만 사용

    private LocalDateTime endAt;

    public enum VoteType {
        YESNO, MULTI
    }
}
