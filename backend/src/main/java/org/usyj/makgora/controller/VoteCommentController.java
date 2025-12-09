package org.usyj.makgora.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.security.CustomUserDetails;
import org.usyj.makgora.service.VoteDetailCommentService;
import org.usyj.makgora.service.VoteDetailService;

import java.util.Map;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class VoteCommentController {

    private final VoteDetailCommentService voteCommentService;
    private final VoteDetailService voteDetailService;

    /* ============================================
       🔥 1) 댓글 조회 (AI Vote 전용)
       ============================================ */
    @GetMapping
    public ResponseEntity<?> getComments(
            @RequestParam Integer voteId
    ) {
        return ResponseEntity.ok(voteCommentService.getComments(voteId));
    }

    /* ============================================
       🔥 2) 댓글 작성 (AI Vote 전용)
       ============================================ */
    @PostMapping
    public ResponseEntity<?> addComment(
            @RequestBody Map<String, Object> req,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        if (user == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        Integer voteId = (Integer) req.get("voteId");
        Integer parentId = req.get("parentId") != null ? (Integer) req.get("parentId") : null;

        String content = (String) req.get("content");
        String position = (String) req.getOrDefault("position", "중립");
        String userPosition = (String) req.getOrDefault("userPosition", "USER");
        Long linkedChoiceId = req.get("linkedChoiceId") != null
                ? Long.valueOf(req.get("linkedChoiceId").toString())
                : null;

        return ResponseEntity.ok(
                voteCommentService.addCommentToVote(
                        voteId,
                        user.getId(),
                        content,
                        parentId,
                        position,
                        userPosition,
                        linkedChoiceId
                )
        );
    }

    /* ============================================
       🔥 3) 댓글 좋아요/싫어요
       ============================================ */
    @PostMapping("/{id}/react")
    public ResponseEntity<?> react(
            @PathVariable Long id,
            @RequestParam boolean like,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        if (user == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        return ResponseEntity.ok(
                voteCommentService.reactComment(id, user.getId(), like)
        );
    }

    /* ============================================
   🔥 5) 댓글 수정
   ============================================ */
@PutMapping("/{id}")
public ResponseEntity<?> updateComment(
        @PathVariable Long id,
        @RequestBody Map<String, Object> req,
        @AuthenticationPrincipal CustomUserDetails user
) {
    if (user == null) {
        return ResponseEntity.status(401).body("로그인이 필요합니다.");
    }

    String newContent = (String) req.get("content");
    if (newContent == null || newContent.trim().isEmpty()) {
        return ResponseEntity.badRequest().body("수정할 내용을 입력하세요.");
    }

    return ResponseEntity.ok(
            voteDetailService.updateComment(
                    id,
                    user.getId(),
                    newContent.trim()
            )
    );
}

    /* ============================================
       🔥 4) 댓글 삭제 (Soft Delete)
       ============================================ */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComment(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        if (user == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        voteCommentService.deleteComment(id, user.getId());
        return ResponseEntity.ok("댓글 삭제 완료");
    }
}
