package org.usyj.makgora.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.request.voteDetails.NormalVoteCommentRequest;
import org.usyj.makgora.response.voteDetails.VoteDetailCommentResponse;
import org.usyj.makgora.security.CustomUserDetails;
import org.usyj.makgora.service.NormalVoteCommentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/normal-votes/comments")
@RequiredArgsConstructor
public class NormalVoteCommentController {

    private final NormalVoteCommentService normalCommentService;

    @GetMapping
public List<VoteDetailCommentResponse> getComments(
        @RequestParam Integer normalVoteId,
        @AuthenticationPrincipal CustomUserDetails user
) {
    Integer userId = (user != null) ? user.getId() : null;  // NPE 방지
    return normalCommentService.getComments(normalVoteId, userId);
}

    @PostMapping
    public VoteDetailCommentResponse addComment(
            @RequestBody NormalVoteCommentRequest req,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return normalCommentService.addComment(
                req.getNormalVoteId().intValue(),
                (user.getId()),
                req.getContent(),
                req.getParentId()
        );
    }

    @PostMapping("/{id}/react")
    public VoteDetailCommentResponse react(
            @PathVariable Long id,
            @RequestParam boolean like,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return normalCommentService.react(id,(user.getId()), like);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComment(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        normalCommentService.deleteComment(id, (user.getId()));
        return ResponseEntity.ok("삭제 성공");
    }
}
