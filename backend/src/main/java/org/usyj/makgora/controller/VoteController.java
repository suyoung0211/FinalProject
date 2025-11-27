package org.usyj.makgora.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.request.vote.VoteCreateRequest;
import org.usyj.makgora.request.vote.VoteParticipateRequest;
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

        return ResponseEntity.ok(voteService.createVote(issueId, req, user.getId().intValue()));
    }

    /** 전체 투표 목록 조회 */
@GetMapping("/list")
public ResponseEntity<List<VoteResponse>> getAllVotes() {
    return ResponseEntity.ok(voteService.getAllVotes());
}

    /** Issue → Vote 목록 */
    @GetMapping("/issue/{issueId}")
    public ResponseEntity<List<VoteResponse>> getVotesByIssue(@PathVariable Integer issueId) {
        return ResponseEntity.ok(voteService.getVotesByIssue(issueId));
    }

    /** Vote 상세 조회 */
    @GetMapping("/{voteId}")
    public ResponseEntity<VoteDetailResponse> getVoteDetail(@PathVariable Integer voteId) {
        return ResponseEntity.ok(voteService.getVoteDetail(voteId));
    }

    /** 투표 참여 */
    @PostMapping("/{voteId}/participate")
    public ResponseEntity<VoteDetailResponse> participate(
            @PathVariable Integer voteId,
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody VoteParticipateRequest req) {

        if (user == null) throw new RuntimeException("로그인이 필요합니다.");

        return ResponseEntity.ok(voteService.participateVote(voteId, req, user.getId().intValue()));
    }

    /** 투표 종료 */
    @PostMapping("/{voteId}/close")
    public ResponseEntity<VoteDetailResponse> closeVote(@PathVariable Integer voteId) {
        return ResponseEntity.ok(voteService.closeVote(voteId));
    }

    /** 보상 배분 */
    @PostMapping("/{voteId}/reward")
    public ResponseEntity<String> distributeReward(@PathVariable Integer voteId) {
        voteService.distributeRewards(voteId);
        return ResponseEntity.ok("보상 배분 완료");
    }
}
