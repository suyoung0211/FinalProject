package org.usyj.makgora.community.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.community.dto.CommunityCommentRequest;
import org.usyj.makgora.community.dto.CommunityCommentResponse;
import org.usyj.makgora.community.service.CommunityCommentService;
import org.usyj.makgora.security.CustomUserDetails;

import java.util.List;

@RestController
@RequestMapping("/api/community")
@RequiredArgsConstructor
public class CommunityCommentController {

    private final CommunityCommentService communityCommentService;

    /**
     * 특정 게시글의 댓글/대댓글 목록 조회
     */
    @GetMapping("/posts/{postId}/comments")
    public List<CommunityCommentResponse> getComments(
            @PathVariable Long postId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Integer currentUserId = (userDetails != null) ? userDetails.getId() : null;
        return communityCommentService.getCommentsByPost(postId, currentUserId);
    }

    /**
     * 댓글/대댓글 작성
     * - request.parentCommentId == null  → 일반 댓글
     * - request.parentCommentId != null → 대댓글
     */
    @PostMapping("/posts/{postId}/comments")
    public CommunityCommentResponse createComment(
            @PathVariable Long postId,
            @RequestBody CommunityCommentRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Integer userId = userDetails.getId();
        return communityCommentService.createComment(postId, userId, request);
    }

    /**
     * 댓글 수정 (본인만 가능)
     */
    @PutMapping("/comments/{commentId}")
    public CommunityCommentResponse updateComment(
            @PathVariable Long commentId,
            @RequestBody CommunityCommentRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Integer userId = userDetails.getId();
        return communityCommentService.updateComment(commentId, userId, request);
    }

    /**
     * 댓글 삭제 (본인만 가능)
     */
    @DeleteMapping("/comments/{commentId}")
    public void deleteComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Integer userId = userDetails.getId();
        communityCommentService.deleteComment(commentId, userId);
    }

    // 추천/비추천은 엔티티/DB 필드 생기면 따로 다시 추가하자.
}
