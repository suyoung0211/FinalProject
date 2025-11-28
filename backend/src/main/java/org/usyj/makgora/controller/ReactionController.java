package org.usyj.makgora.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.service.ArticleReactionService;

@RestController
@RequestMapping("/api/article")
@RequiredArgsConstructor
public class ReactionController {

    private final ArticleReactionService reactionService;

    @PostMapping("/{id}/view")
    public ResponseEntity<?> increaseView(@PathVariable Integer id) {
        reactionService.increaseViewCount(id);
        return ResponseEntity.ok("view +1");
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<?> increaseLike(@PathVariable Integer id) {
        reactionService.increaseLikeCount(id);
        return ResponseEntity.ok("like +1");
    }

    @PostMapping("/{id}/comment")
    public ResponseEntity<?> increaseComment(@PathVariable Integer id) {
        reactionService.increaseCommentCount(id);
        return ResponseEntity.ok("comment +1");
    }
}
