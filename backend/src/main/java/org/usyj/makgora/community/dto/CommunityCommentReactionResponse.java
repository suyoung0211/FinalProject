package org.usyj.makgora.community.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CommunityCommentReactionResponse {
    private Long commentId;
    private Long likeCount;
    private Long dislikeCount;
    private boolean likedByMe;
    private boolean dislikedByMe;
}
