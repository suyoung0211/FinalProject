package org.usyj.makgora.request.voteDetails;

import lombok.Data;
import java.time.LocalDateTime;
import org.usyj.makgora.entity.NormalVoteEntity;

@Data
public class NormalVoteUpdateRequest {
    private String title;
    private String description;
    private NormalVoteEntity.NormalCategory category;
    private LocalDateTime endAt;
}