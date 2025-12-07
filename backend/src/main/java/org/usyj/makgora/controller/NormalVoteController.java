package org.usyj.makgora.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.request.normalvote.NormalVoteCreateRequest;
import org.usyj.makgora.request.normalvote.NormalVoteFullUpdateRequest;
import org.usyj.makgora.response.normalvote.*;
import org.usyj.makgora.response.voteDetails.NormalVoteResultResponse;
import org.usyj.makgora.security.CustomUserDetails;
import org.usyj.makgora.service.NormalVoteService;


@RestController
@RequestMapping("/api/normal-votes")
@RequiredArgsConstructor
public class NormalVoteController {

    private final NormalVoteService normalVoteService;

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
    public ResponseEntity<NormalVoteResponse> participate(
        @PathVariable Long voteId,
        @RequestParam Long choiceId,
        @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(
            normalVoteService.participate(voteId, user.getId(), choiceId)
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
    public ResponseEntity<NormalVoteResponse> getDetail(@PathVariable Long id) {
        return ResponseEntity.ok(normalVoteService.getDetail(id));
    }

    /* -----------------------------------------------------
       5. 통합 수정(옵션, 선택지 포함)
     ----------------------------------------------------- */
    @PutMapping("/{id}")
    public ResponseEntity<NormalVoteResponse> update(
            @PathVariable Long id,
            @RequestBody NormalVoteFullUpdateRequest req,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(normalVoteService.updateVote(id, req, user.getId()));
    }

    /* -----------------------------------------------------
       6. 삭제 (soft delete)
     ----------------------------------------------------- */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        normalVoteService.deleteVote(id, user.getId());
        return ResponseEntity.ok("투표가 삭제되었습니다.");
    }

    /* -----------------------------------------------------
       7. 투표 마감 (본인이 생성한 투표만 가능)
     ----------------------------------------------------- */
    @PatchMapping("/{id}/finish")
    public ResponseEntity<?> finish(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(
                normalVoteService.finishVote(id, user.getId())
        );
    }

    /* -----------------------------------------------------
       8. 투표 취소 (CANCELLED)
     ----------------------------------------------------- */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancel(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(
                normalVoteService.cancelVote(id, user.getId())
        );
    }

    /* -----------------------------------------------------
       9. 내가 참여한 일반투표 조회(My Page)
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
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                normalVoteService.getResult(id)
        );
    }
}
