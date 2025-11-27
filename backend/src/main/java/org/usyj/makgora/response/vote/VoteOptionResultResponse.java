package org.usyj.makgora.response.vote;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.usyj.makgora.entity.VoteOptionEntity;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoteOptionResultResponse {

    private Long optionId;
    private String title;
    private Long count;
    private Integer percent;

    public static VoteOptionResultResponse of(VoteOptionEntity opt, long count, int percent) {
        return VoteOptionResultResponse.builder()
                .optionId(opt.getId())
                .title(opt.getOptionTitle())
                .count(count)
                .percent(percent)
                .build();
    }
}
