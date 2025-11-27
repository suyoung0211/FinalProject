package org.usyj.makgora.request.vote;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VoteCreateRequest {

    private String title;

    // YES/NO 또는 MULTI
    private VoteType type;

    // 다중 옵션일 때만 사용
    private List<String> options;

    private LocalDateTime endAt;

    public enum VoteType {
        YESNO, MULTI
    }
}