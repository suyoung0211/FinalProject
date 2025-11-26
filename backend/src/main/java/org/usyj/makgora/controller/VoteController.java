package org.usyj.makgora.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.request.vote.VoteCreateRequest;
import org.usyj.makgora.response.vote.VoteDetailResponse;
import org.usyj.makgora.response.vote.VoteResponse;
import org.usyj.makgora.security.CustomUserDetails;
import org.usyj.makgora.service.VoteService;

import java.util.List;

@RestController
@RequestMapping("/api/votes")
@RequiredArgsConstructor
public class VoteController {

    private final VoteService voteService;

    /** Issue → Vote 생성 */
    @PostMapping("/issue/{issueId}")
public ResponseEntity<VoteResponse> createVote(
        @PathVariable Integer issueId,
        @AuthenticationPrincipal CustomUserDetails user,
        @RequestBody VoteCreateRequest req) {

    if (user == null) throw new RuntimeException("로그인이 필요합니다.");

    return ResponseEntity.ok(voteService.createVote(issueId, req, user.getId()));
}

    /** Issue → Vote 목록 */
    @GetMapping("/issue/{issueId}")
    public ResponseEntity<List<VoteResponse>> getVotesByIssue(
            @PathVariable Integer issueId) {

        return ResponseEntity.ok(voteService.getVotesByIssue(issueId));
    }

    @GetMapping("/{voteId}")
public ResponseEntity<VoteDetailResponse> getVoteDetail(
        @PathVariable Integer voteId) {

    return ResponseEntity.ok(voteService.getVoteDetail(voteId));
}
}
