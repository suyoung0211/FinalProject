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
public class VoteResponse {

    private Integer voteId;
    private String title;
    private String status;
    private LocalDateTime endAt;

    private Integer totalPoints;
    private Integer totalParticipants;

    /** YES/NO 투표일 경우에만 세팅 (옵션이 2개일 때) */
    private Integer yesPercent;
    private Integer noPercent;

    public static VoteResponse of(
            VoteEntity vote,
            List<VoteOptionResultResponse> options,
            long totalParticipants
    ) {
        Integer yesPercent = null;
        Integer noPercent = null;

        if (options != null && options.size() == 2) {
            yesPercent = options.get(0).getPercent();
            noPercent = options.get(1).getPercent();
        }

        return VoteResponse.builder()
                .voteId(vote.getId())
                .title(vote.getTitle())
                .status(vote.getStatus().name())
                .endAt(vote.getEndAt())
                .totalPoints(vote.getTotalPoints())
                .totalParticipants((int) totalParticipants)
                .yesPercent(yesPercent)
                .noPercent(noPercent)
                .build();
    }
}
