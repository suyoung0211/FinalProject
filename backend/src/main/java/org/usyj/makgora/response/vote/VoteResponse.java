package org.usyj.makgora.response.vote;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.usyj.makgora.entity.VoteEntity;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
public class VoteResponse {

    private Integer voteId;
    private String title;
    private String status;
    private Integer totalPoints;
    private Integer totalParticipants;
    private LocalDateTime endAt;

    private List<VoteOptionResultResponse> options; // YES/NO 등

    /**
     * 상세 조회용 변환 메서드
     */
    public static VoteResponse of(
            VoteEntity v,
            List<VoteOptionResultResponse> options,
            long participants
    ) {
        return VoteResponse.builder()
                .voteId(v.getId())
                .title(v.getTitle())
                .status(v.getStatus().name())
                .totalPoints(v.getTotalPoints())
                .totalParticipants((int) participants)
                .endAt(v.getEndAt())
                .options(options)
                .build();
    }

    /**
     * 🔥 전체 리스트 조회용 변환 메서드 (options 없이 단순 변환)
     */
    public static VoteResponse fromEntity(VoteEntity v) {
        return VoteResponse.builder()
                .voteId(v.getId())
                .title(v.getTitle())
                .status(v.getStatus().name())
                .totalPoints(v.getTotalPoints())
                .totalParticipants(v.getTotalParticipants())
                .endAt(v.getEndAt())
                .options(null)  // 리스트 조회에서는 옵션 필요 없음
                .build();
    }
}
