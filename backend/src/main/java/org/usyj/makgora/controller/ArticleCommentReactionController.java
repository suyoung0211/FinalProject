package org.usyj.makgora.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.security.CustomUserDetails;
import org.usyj.makgora.service.ArticleCommentReactionService;
import org.usyj.makgora.request.article.ReactionRequest;
import org.usyj.makgora.response.article.ArticleCommentReactionResponse;

@RestController
@RequestMapping("/api/articles/comments")
@RequiredArgsConstructor
public class ArticleCommentReactionController {

    private final ArticleCommentReactionService service;

    /** 🔥 댓글 반응(LIKE / DISLIKE / RESET) */
    @PostMapping("/{commentId}/reaction")
    public ResponseEntity<?> react(
            @PathVariable Long commentId,
            @RequestBody ReactionRequest req,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        if (user == null) return ResponseEntity.status(401).body("로그인 필요");

        ArticleCommentReactionResponse resp =
                service.react(commentId, user.getId().longValue(), req.getReaction());

        return ResponseEntity.ok(resp);
    }
}

