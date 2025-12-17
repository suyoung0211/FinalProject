package org.usyj.makgora.normalVote.dto.request;

import lombok.Data;
import java.time.LocalDateTime;

import org.usyj.makgora.normalVote.entity.NormalVoteEntity;

@Data
public class NormalVoteUpdateRequest {
    private String title;
    private String description;
    private NormalVoteEntity.NormalCategory category;
    private LocalDateTime endAt;
}