package org.usyj.makgora.article.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.article.dto.request.ReactionRequest;
import org.usyj.makgora.article.dto.response.ArticleReactionResponse;
import org.usyj.makgora.article.service.ArticleReactionService;
import org.usyj.makgora.global.security.CustomUserDetails;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleReactionController {

    private final ArticleReactionService reactionService;

    /** 조회수 증가 */
    @PostMapping("/{id}/view")
    public ResponseEntity<?> addView(@PathVariable Integer id) {
        reactionService.addView(id);
        return ResponseEntity.ok("view +1");
    }

    /** 댓글수 증가 */
    @PostMapping("/{id}/comment")
    public ResponseEntity<?> addComment(@PathVariable Integer id) {
        reactionService.addComment(id);
        return ResponseEntity.ok("comment +1");
    }

    /** 좋아요 */
@PostMapping("/{id}/like")
public ResponseEntity<ArticleReactionResponse> like(
        @PathVariable Integer id,
        @AuthenticationPrincipal CustomUserDetails user
) {
    if (user == null) return ResponseEntity.status(401).build();

    ArticleReactionResponse resp =
            reactionService.react(id, user.getId(), 1);

    return ResponseEntity.ok(resp);
}

/** 싫어요 */
@PostMapping("/{id}/dislike")
public ResponseEntity<ArticleReactionResponse> dislike(
        @PathVariable Integer id,
        @AuthenticationPrincipal CustomUserDetails user
) {
    if (user == null) return ResponseEntity.status(401).build();

    ArticleReactionResponse resp =
            reactionService.react(id, user.getId(), -1);

    return ResponseEntity.ok(resp);
}

/** 반응 취소 */
@PostMapping("/{id}/reaction/reset")
public ResponseEntity<ArticleReactionResponse> resetReaction(
        @PathVariable Integer id,
        @AuthenticationPrincipal CustomUserDetails user
) {
    if (user == null) return ResponseEntity.status(401).build();

    ArticleReactionResponse resp =
            reactionService.react(id, user.getId(), 0);

    return ResponseEntity.ok(resp);
}

@PostMapping("/{id}/reaction")
public ResponseEntity<ArticleReactionResponse> react(
        @PathVariable Integer id,
        @RequestBody ReactionRequest request,
        @AuthenticationPrincipal CustomUserDetails user
) {
    if (user == null) return ResponseEntity.status(401).build();

    ArticleReactionResponse resp =
            reactionService.react(id, user.getId(), request.getReaction());

    return ResponseEntity.ok(resp);
}
}
