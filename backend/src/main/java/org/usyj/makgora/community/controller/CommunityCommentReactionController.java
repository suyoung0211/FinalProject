package org.usyj.makgora.community.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.security.CustomUserDetails;
import org.usyj.makgora.community.service.CommunityCommentReactionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/community/comments")
public class CommunityCommentReactionController {

    private final CommunityCommentReactionService service;

    @PostMapping("/{id}/like")
    public ResponseEntity<?> like(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        if (user == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        return ResponseEntity.ok(service.like(id, user.getId().longValue()));
    }

    @PostMapping("/{id}/dislike")
    public ResponseEntity<?> dislike(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        if (user == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        return ResponseEntity.ok(service.dislike(id, user.getId().longValue()));
    }
}
