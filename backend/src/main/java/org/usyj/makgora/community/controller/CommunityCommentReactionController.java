package org.usyj.makgora.community.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.community.dto.CommunityCommentReactionResponse;
import org.usyj.makgora.community.service.CommunityCommentReactionService;
import org.usyj.makgora.global.security.CustomUserDetails;

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

    try {
        System.out.println("댓글 추천 요청 - commentId: " + id + ", userId: " + user.getId());
        
        // 🔥 변경됨: 반환 타입을 Response 객체로 받기
        CommunityCommentReactionResponse result = service.like(id, user.getId().longValue());
        
        System.out.println("댓글 추천 결과: " + result);
        return ResponseEntity.ok(result);  // JSON 반환
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(500)
                .body("댓글 추천 처리 중 오류가 발생했습니다: " + e.getMessage());
    }
}

    @PostMapping("/{id}/dislike")
public ResponseEntity<?> dislike(
        @PathVariable Long id,
        @AuthenticationPrincipal CustomUserDetails user
) {
    if (user == null) {
        return ResponseEntity.status(401).body("로그인이 필요합니다.");
    }

    try {
        System.out.println("댓글 비추천 요청 - commentId: " + id + ", userId: " + user.getId());

        // 🔥 여기 수정!
        CommunityCommentReactionResponse result =
                service.dislike(id, user.getId().longValue());

        System.out.println("댓글 비추천 결과: " + result);
        return ResponseEntity.ok(result);

    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(500)
                .body("댓글 비추천 처리 중 오류가 발생했습니다: " + e.getMessage());
    }
}
}