package org.usyj.makgora.request.voteDetails;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

import org.usyj.makgora.vote.entity.NormalVoteEntity;

@Data
public class NormalVoteFullUpdateRequest {

    private String title;
    private String description;
    private NormalVoteEntity.NormalCategory category;
    private LocalDateTime endAt;

    private List<OptionUpdate> options;

    @Data
    public static class OptionUpdate {
        private Long optionId;
        private String text;
    }
}
