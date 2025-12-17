package org.usyj.makgora.vote.dto.voteDetailRequest;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

/**
 * 🎯 VoteDetailCommentUpdateRequest
 * 댓글 내용을 수정할 때 사용하는 요청 DTO.
 */
@Getter @Setter @Builder
public class VoteDetailCommentUpdateRequest {

    private Integer commentId;

    private String content;
    private String position;

    private Integer userId;
}
