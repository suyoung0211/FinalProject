package org.usyj.makgora.vote.dto.voteDetailRequest;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

/**
 * 🎯 VoteDetailCommentDeleteRequest
 * 댓글을 삭제할 때 사용하는 Request DTO.
 */
@Getter @Setter @Builder
public class VoteDetailCommentDeleteRequest {

    private Long commentId;
    private Long userId;
}
