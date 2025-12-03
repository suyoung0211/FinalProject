package org.usyj.makgora.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.request.vote.VoteParticipateRequest;
import org.usyj.makgora.response.vote.VoteResponse;
import org.usyj.makgora.security.CustomUserDetails;
import org.usyj.makgora.service.VoteService;
import org.usyj.makgora.request.vote.VoteAiCreateRequest;
import org.usyj.makgora.request.vote.VoteCancelRequest;

@RestController
@RequestMapping("/api/votes")
@RequiredArgsConstructor
public class VoteController {

    private final VoteService voteService;

    /** ① 투표 상세 조회 */
    @GetMapping("/{voteId}")
    public ResponseEntity<VoteResponse> getVote(@PathVariable Integer voteId) {
        return ResponseEntity.ok(voteService.getVoteDetail(voteId));
    }

    /** ② 투표 참여 */
    @PostMapping("/{voteId}/participate")
    public ResponseEntity<?> participate(
            @PathVariable Integer voteId,
            @RequestBody VoteParticipateRequest req,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(voteService.participateVote(voteId, req, user.getId()));
    }

    /** ③ 내 투표 조회 */
    @GetMapping("/{voteId}/my")
    public ResponseEntity<?> getMyVote(
            @PathVariable Integer voteId,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(voteService.getMyVote(voteId, user.getId()));
    }

    /** ④ 내 베팅 취소 */
    @PatchMapping("/my/{voteUserId}/cancel")
public ResponseEntity<?> cancelMyVote(
        @PathVariable Long voteUserId,
        @AuthenticationPrincipal CustomUserDetails user
) {
    return ResponseEntity.ok(voteService.cancelMyVote(voteUserId, user.getId()));
}

    /** ⑤ 관리자: 투표 취소 */
    @PatchMapping("/{voteId}/admin/cancel")
    public ResponseEntity<?> adminCancelVote(
            @PathVariable Integer voteId,
            @RequestBody VoteCancelRequest req
    ) {
        return ResponseEntity.ok(voteService.cancelVoteAdmin(voteId, req));
    }

    /** ⑥ 관리자: 투표 종료 */
    @PostMapping("/{voteId}/admin/finish")
    public ResponseEntity<?> finishVote(@PathVariable Integer voteId) {
        return ResponseEntity.ok(voteService.finishVote(voteId));
    }

    /** ⑦ 관리자: 정답 확정 */
    @PostMapping("/{voteId}/resolve/{choiceId}")
    public ResponseEntity<?> resolveVote(
            @PathVariable Integer voteId,
            @PathVariable Long choiceId
    ) {
        return ResponseEntity.ok(voteService.resolveVote(voteId, choiceId));
    }

    /** ⑧ 관리자: 보상 지급 */
    @PostMapping("/{voteId}/admin/reward")
    public ResponseEntity<?> rewardVote(@PathVariable Integer voteId) {
        return ResponseEntity.ok(voteService.rewardVote(voteId));
    }

    /** ⑨ odds 확인 (실시간/최종 배당 조회) */
@GetMapping("/{voteId}/odds")
public ResponseEntity<?> getOdds(@PathVariable Integer voteId) {
    return ResponseEntity.ok(voteService.getOdds(voteId));
}

/** 🔥 내가 참여한 모든 투표 조회 */
@GetMapping("/my")
public ResponseEntity<?> getMyVotes(@AuthenticationPrincipal CustomUserDetails user) {
    return ResponseEntity.ok(voteService.getMyVotes(user.getId()));
}

/** 🔥 내 투표 통계 조회 */
@GetMapping("/my/statistics")
public ResponseEntity<?> getMyVoteStatistics(@AuthenticationPrincipal CustomUserDetails user) {
    return ResponseEntity.ok(voteService.getMyStatistics(user.getId()));
}

@GetMapping("/list")
public ResponseEntity<?> getVoteList() {
    return ResponseEntity.ok(voteService.getAllVotes());
}

/**
     * 🔥 Python AI가 호출하는 자동 투표 생성 엔드포인트
     * POST /api/votes/ai-create
     */
    @PostMapping("/ai-create")
    public ResponseEntity<VoteResponse> createByAi(@RequestBody VoteAiCreateRequest req) {
        VoteResponse res = voteService.createVoteByAI(req);
        return ResponseEntity.ok(res);
    }
}
