package org.usyj.makgora.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.request.normalvote.NormalVoteCreateRequest;
import org.usyj.makgora.request.normalvote.NormalVoteFullUpdateRequest;
import org.usyj.makgora.request.normalvote.NormalVoteParticipateRequest;
import org.usyj.makgora.response.normalvote.*;
import org.usyj.makgora.response.voteDetails.NormalVoteResultResponse;
import org.usyj.makgora.security.CustomUserDetails;
import org.usyj.makgora.service.NormalVoteDetailService;
import org.usyj.makgora.service.NormalVoteService;

@RestController
@RequestMapping("/api/normal-votes")
@RequiredArgsConstructor
public class NormalVoteController {

    private final NormalVoteService normalVoteService;
    private final NormalVoteDetailService normalVoteDetailService;

    /* -----------------------------------------------------
       1. 일반투표 생성
     ----------------------------------------------------- */
    @PostMapping("/normal_create")
    public ResponseEntity<NormalVoteResponse> create(
            @RequestBody NormalVoteCreateRequest req,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(normalVoteService.createVote(req, user.getId()));
    }

    /* -----------------------------------------------------
       2. 참여
     ----------------------------------------------------- */
    @PostMapping("/{voteId}/participate")
public ResponseEntity<?> participate(
    @PathVariable Integer voteId,
    @RequestBody NormalVoteParticipateRequest req,
    @AuthenticationPrincipal CustomUserDetails user
) {
    return ResponseEntity.ok(
        normalVoteService.participate(
            voteId,
            req.getChoiceId(),
            user.getId()
        )
    );
}

    /* -----------------------------------------------------
       3. 전체 조회
     ----------------------------------------------------- */
    @GetMapping("/list")
    public ResponseEntity<NormalVoteListResponse> getList() {
        return ResponseEntity.ok(normalVoteService.getAllVotes());
    }

    /* -----------------------------------------------------
       4. 상세 조회
     ----------------------------------------------------- */
    @GetMapping("/{id}")
public ResponseEntity<?> getNormalVoteDetail(
        @PathVariable Integer id,
        @AuthenticationPrincipal CustomUserDetails user
) {
    Integer userId = (user != null) ? user.getId() : null;
    return ResponseEntity.ok(normalVoteDetailService.getDetail(id, userId));
}

    /* -----------------------------------------------------
       5. 통합 수정
     ----------------------------------------------------- */
    @PutMapping("/{id}")
    public ResponseEntity<NormalVoteResponse> update(
            @PathVariable Integer id,     // 🔥 Long → Integer 변경
            @RequestBody NormalVoteFullUpdateRequest req,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(normalVoteService.updateVote(id, req, user.getId()));
    }

    /* -----------------------------------------------------
       6. 삭제
     ----------------------------------------------------- */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @PathVariable Integer id,     // 🔥 Long → Integer 변경
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        normalVoteService.deleteVote(id, user.getId());
        return ResponseEntity.ok("투표가 삭제되었습니다.");
    }

    /* -----------------------------------------------------
       7. 투표 마감
     ----------------------------------------------------- */
    @PatchMapping("/{id}/finish")
    public ResponseEntity<?> finish(
            @PathVariable Integer id,     // 🔥 Long → Integer 변경
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(
                normalVoteService.finishVote(id, user.getId())
        );
    }

    /* -----------------------------------------------------
       8. 투표 취소
     ----------------------------------------------------- */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancel(
            @PathVariable Integer id,    // 🔥 Long → Integer 변경
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(
                normalVoteService.cancelVote(id, user.getId())
        );
    }

    /* -----------------------------------------------------
       9. 내가 참여한 일반투표 조회
     ----------------------------------------------------- */
    @GetMapping("/my")
    public ResponseEntity<?> getMyNormalVotes(
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(
                normalVoteService.getMyParticipatedVotes(user.getId())
        );
    }

    /* -----------------------------------------------------
       10. 일반투표 결과 조회
     ----------------------------------------------------- */
    @GetMapping("/{id}/result")
    public ResponseEntity<NormalVoteResultResponse> getResult(
            @PathVariable Integer id   // 🔥 Long → Integer 변경
    ) {
        return ResponseEntity.ok(
                normalVoteService.getResult(id)
        );
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
@PostMapping("/{id}/cancel")
public ResponseEntity<?> cancelNormalVote(
        @PathVariable Integer normalVoteId
) {
    normalVoteService.cancelVoteAdmin(normalVoteId);
    return ResponseEntity.ok("Normal vote canceled");
}
}
