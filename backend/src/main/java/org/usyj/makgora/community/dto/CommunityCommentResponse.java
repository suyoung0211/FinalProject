package org.usyj.makgora.community.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
public class CommunityCommentResponse {

    private Long commentId;
    private Long postId;
    private Long parentCommentId;

    private Integer userId;
    private String nickname;

    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Long likeCount;
    private Long dislikeCount;

    private boolean mine;          // 내가 쓴 댓글인지 여부
    private boolean likedByMe;     // 👍 내가 좋아요 눌렀는지
    private boolean dislikedByMe;  // 👎 내가 비추천 눌렀는지

    private List<CommunityCommentResponse> replies; // 대댓글

    private String avatarIcon;
    private String profileFrame;
    private String profileBadge;
}
