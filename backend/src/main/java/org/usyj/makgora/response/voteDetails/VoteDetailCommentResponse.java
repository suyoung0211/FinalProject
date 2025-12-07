package org.usyj.makgora.response.voteDetails;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

/**
 * 🎯 VoteDetailCommentResponse
 * 투표 상세 페이지에서 보여줄 댓글/대댓글 트리 구조.
 * - position(찬성/반대/중립)
 * - userPosition 등 표시 가능
 */
@Getter @Setter @Builder
public class VoteDetailCommentResponse {

    private Integer commentId;

    private Integer voteId;
    private Integer normalVoteId;

    private Integer userId;
    private String username;
    private String userPosition;

    private String position;
    private String content;

    private Integer likeCount;
    private Integer linkedChoiceId;
    private Integer linkedNormalChoiceId;
    private Integer dislikeCount;
    private Boolean myLike;    // 내가 좋아요 했는가
    private Boolean myDislike;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Integer parentId;

    private List<VoteDetailCommentResponse> children;
}
