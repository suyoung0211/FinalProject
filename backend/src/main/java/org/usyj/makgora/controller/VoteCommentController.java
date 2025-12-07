package org.usyj.makgora.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.security.CustomUserDetails;
import org.usyj.makgora.service.VoteDetailCommentService;
import org.usyj.makgora.service.NormalVoteCommentService;
import org.usyj.makgora.response.voteDetails.VoteDetailCommentResponse;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class VoteCommentController {

    private final VoteDetailCommentService voteCommentService;
    private final NormalVoteCommentService normalVoteCommentService;

    /* ============================================
       🔥 1) 댓글 조회 (AI Vote 또는 Normal Vote)
       ============================================ */
    @GetMapping
    public ResponseEntity<?> getComments(
            @RequestParam(required = false) Integer voteId,
            @RequestParam(required = false) Long normalVoteId
    ) {
        if (voteId != null) {
            List<VoteDetailCommentResponse> list = voteCommentService.getComments(voteId);
            return ResponseEntity.ok(list);
        }

        if (normalVoteId != null) {
            List<VoteDetailCommentResponse> list = normalVoteCommentService.getComments(normalVoteId);
            return ResponseEntity.ok(list);
        }

        return ResponseEntity.badRequest().body("voteId 또는 normalVoteId 중 하나는 반드시 필요합니다.");
    }

    /* ============================================
       🔥 2) 댓글 작성 (AI Vote + NormalVote 공용)
       ============================================ */
    @PostMapping
    public ResponseEntity<?> addComment(
            @RequestBody Map<String, Object> req,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        if (user == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        Integer voteId = req.get("voteId") != null ? (Integer) req.get("voteId") : null;
        Long normalVoteId = req.get("normalVoteId") != null ? Long.valueOf(req.get("normalVoteId").toString()) : null;
        Integer parentId = req.get("parentId") != null ? (Integer) req.get("parentId") : null;

        String content = (String) req.get("content");
        String position = (String) req.getOrDefault("position", "중립");
        String userPosition = (String) req.getOrDefault("userPosition", "USER");
        Long linkedChoiceId = req.get("linkedChoiceId") != null ? Long.valueOf(req.get("linkedChoiceId").toString()) : null;

        if (voteId != null) {
            return ResponseEntity.ok(
                    voteCommentService.addCommentToVote(
                            voteId, user.getId(), content, parentId, position, userPosition, linkedChoiceId
                    )
            );
        }

        if (normalVoteId != null) {
            return ResponseEntity.ok(
                    voteCommentService.addCommentToNormalVote(
                            normalVoteId, user.getId(), content, parentId, position, userPosition, linkedChoiceId
                    )
            );
        }

        return ResponseEntity.badRequest().body("voteId 또는 normalVoteId 필요");
    }

    /* ============================================
       🔥 3) 댓글 좋아요/싫어요 (AI + NormalVote 공용)
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
       🔥 4) 댓글 삭제 (본인만 가능)
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
