package org.usyj.makgora.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.request.normalvote.NormalVoteCreateRequest;
import org.usyj.makgora.request.normalvote.NormalVoteFullUpdateRequest;
import org.usyj.makgora.response.normalvote.*;
import org.usyj.makgora.security.CustomUserDetails;
import org.usyj.makgora.service.NormalVoteService;


@RestController
@RequestMapping("/api/normal-votes")
@RequiredArgsConstructor
public class NormalVoteController {

    private final NormalVoteService normalVoteService;

    /* 생성 */
    @PostMapping("/normal_create")
    public ResponseEntity<NormalVoteResponse> create(
            @RequestBody NormalVoteCreateRequest req,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(normalVoteService.createVote(req, user.getId()));
    }

    @PostMapping("/{voteId}/participate")
    public ResponseEntity<NormalVoteResponse> participate(
        @PathVariable Long voteId,
        @RequestParam Long choiceId,
        @AuthenticationPrincipal CustomUserDetails user
    ){
    return ResponseEntity.ok(
        normalVoteService.participate(voteId, user.getId(), choiceId)
    );
}

    /* 전체 조회 */
    @GetMapping("/list")
    public ResponseEntity<NormalVoteListResponse> getList() {
        return ResponseEntity.ok(normalVoteService.getAllVotes());
    }

    /* 상세 조회 */
    @GetMapping("/{id}")
    public ResponseEntity<NormalVoteResponse> getDetail(@PathVariable Long id) {
        return ResponseEntity.ok(normalVoteService.getDetail(id));
    }

    /* 전체 수정(옵션 포함) */
    @PutMapping("/{id}")
    public ResponseEntity<NormalVoteResponse> update(
            @PathVariable Long id,
            @RequestBody NormalVoteFullUpdateRequest req,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(normalVoteService.updateVote(id, req, user.getId()));
    }

    /* 삭제 */
@DeleteMapping("/{id}")
public ResponseEntity<?> delete(
        @PathVariable Long id,
        @AuthenticationPrincipal CustomUserDetails user
) {
    normalVoteService.deleteVote(id, user.getId());
    return ResponseEntity.ok("투표가 삭제되었습니다.");
}
}
