package org.usyj.makgora.dto.home;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VoteListDto {

    private Integer voteId;           // 투표 ID
    private String title;          // 투표 제목
    private String status;         // 상태 (REVIEWING, ONGOING, FINISHED, ...)
    private LocalDateTime endAt;   // 종료 시간
    private Integer totalPoints;      // 총 베팅 포인트 (또는 총 참여수)
    private Integer totalParticipants;      // 🔥 참여자 수 (카드 UI에서 필요)
}
