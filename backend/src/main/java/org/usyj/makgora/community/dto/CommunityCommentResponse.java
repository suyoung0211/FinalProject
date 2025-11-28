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

    private int likeCount;
    private int dislikeCount;

    private boolean mine; // 현재 로그인 유저가 쓴 댓글인지

    // 대댓글 리스트 (2단계까지만 쓴다 해도 구조는 이렇게 잡아두면 좋음)
    private List<CommunityCommentResponse> replies;
}