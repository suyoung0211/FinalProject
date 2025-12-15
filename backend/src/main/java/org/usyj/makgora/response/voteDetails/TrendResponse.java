package org.usyj.makgora.response.voteDetails;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TrendResponse {

    private LocalDateTime recordedAt; // 시간
    private Integer yesPercent;       // YES %
    private Integer noPercent;        // NO %
}
