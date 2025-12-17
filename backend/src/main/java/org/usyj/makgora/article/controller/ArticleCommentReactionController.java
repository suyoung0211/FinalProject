// src/main/java/org/usyj/makgora/controller/ArticleCommentReactionController.java
package org.usyj.makgora.article.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.article.dto.request.ReactionRequest;
import org.usyj.makgora.article.dto.response.ArticleCommentReactionResponse;
import org.usyj.makgora.article.service.ArticleCommentReactionService;
import org.usyj.makgora.global.security.CustomUserDetails;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/articles/comments")
public class ArticleCommentReactionController {

    private final ArticleCommentReactionService reactionService;

    @PostMapping("/{commentId}/reactions")
    public ResponseEntity<?> react(
            @PathVariable Long commentId,
            @RequestBody ReactionRequest request,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        if (user == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        ArticleCommentReactionResponse resp =
                reactionService.react(commentId, user.getId(), request.getReaction());

        return ResponseEntity.ok(resp);
    }
}
