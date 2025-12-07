package org.usyj.makgora.request.voteDetails;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

/**
 * 🎯 VoteDetailCommentCreateRequest
 * 투표 상세 페이지에서 댓글 또는 대댓글을 생성할 때 사용하는 Request DTO.
 */
@Getter @Setter @Builder
public class VoteDetailCommentCreateRequest {

    private String content;

    private Integer issueId;
    private Integer voteId;
    private Integer normalVoteId;

    private Integer parentId;

    private String position;
    private Integer userId;
}