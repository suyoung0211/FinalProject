package org.usyj.makgora.response.vote;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.usyj.makgora.entity.VoteEntity;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoteDetailResponse {

    private Integer voteId;
    private String title;
    private String status;
    private LocalDateTime endAt;

    private Integer totalPoints;
    private Integer totalParticipants;

    /** 옵션 + 퍼센트 전체 */
    private List<VoteOptionResultResponse> options;

    public static VoteDetailResponse of(
            VoteEntity vote,
            List<VoteOptionResultResponse> options,
            long totalParticipants
    ) {
        return VoteDetailResponse.builder()
                .voteId(vote.getId())
                .title(vote.getTitle())
                .status(vote.getStatus().name())
                .endAt(vote.getEndAt())
                .totalPoints(vote.getTotalPoints())
                .totalParticipants((int) totalParticipants)
                .options(options)
                .build();
    }
}
