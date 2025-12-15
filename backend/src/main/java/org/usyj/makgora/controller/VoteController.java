package org.usyj.makgora.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import org.usyj.makgora.request.vote.*;
import org.usyj.makgora.response.VoteTrendChartResponse;
import org.usyj.makgora.response.vote.OddsResponse;
import org.usyj.makgora.response.voteDetails.*;
import org.usyj.makgora.security.CustomUserDetails;
import org.usyj.makgora.service.*;

@RestController
@RequestMapping("/api/votes")
@RequiredArgsConstructor
public class VoteController {

    private final VoteService voteService;
    private final VoteDetailService voteDetailService;
    private final OddsService oddsService;

    /* =====================================================
       1️⃣ 투표 목록 / 상세
       ===================================================== */

    /** 🔥 투표 목록 */
    @GetMapping
    public ResponseEntity<?> getVoteList() {
        return ResponseEntity.ok(voteService.getVoteList());
    }

    /** 🔥 투표 상세 */
    @GetMapping("/{voteId}")
    public ResponseEntity<VoteDetailMainResponse> getVoteDetail(
            @PathVariable Integer voteId,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        Integer userId = user != null ? user.getId() : null;
        return ResponseEntity.ok(
                voteDetailService.getVoteDetail(voteId, userId)
        );
    }

    /* =====================================================
       2️⃣ 배당 관련
       ===================================================== */

    @GetMapping("/{voteId}/expected-odds")
public ResponseEntity<ExpectedOddsResponse> getExpectedOdds(
        @PathVariable Integer voteId,
        @RequestParam Integer choiceId,
        @RequestParam int amount
) {
    return ResponseEntity.ok(
            oddsService.getExpectedOdds(voteId, choiceId, amount)
    );
}

/** 🔥 현재 옵션별 배당률 조회 */
@GetMapping("/{voteId}/odds")
public ResponseEntity<OddsResponse> getCurrentOdds(
        @PathVariable Integer voteId
) {
    return ResponseEntity.ok(
            oddsService.getCurrentOdds(voteId)
    );
}


    /* =====================================================
       3️⃣ 투표 참여 / 취소
       ===================================================== */

    /** 🔥 투표 참여 */
@PostMapping("/{voteId}/participate")
public ResponseEntity<?> participateVote(
        @PathVariable Integer voteId,   // ✅ Integer로 통일
        @RequestBody VoteParticipateRequest req,
        @AuthenticationPrincipal CustomUserDetails user
) {
    return ResponseEntity.ok(
        voteService.participateVote(voteId, req, user.getId())
    );
}

    /** 🔥 내 참여 취소 (voteUserId 기준) */
    @PatchMapping("/my/{voteUserId}/cancel")
    public ResponseEntity<?> cancelMyVote(
            @PathVariable Long voteUserId,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(
                voteService.cancelMyVote(voteUserId, user.getId())
        );
    }

    /** 🔥 내 참여 취소 (voteId 기준) */
    @PatchMapping("/{voteId}/cancel")
    public ResponseEntity<?> cancelVote(
            @PathVariable Integer voteId,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(
                voteService.cancelVote(voteId, user.getId())
        );
    }

    /* =====================================================
       4️⃣ 내 투표 / 통계
       ===================================================== */

    /** 🔥 내가 참여한 투표 */
    @GetMapping("/my")
    public ResponseEntity<?> getMyVotes(
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(
                voteService.getMyVotes(user.getId())
        );
    }

    /** 🔥 내 통계 */
    @GetMapping("/my/statistics")
    public ResponseEntity<?> getMyStatistics(
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(
                voteService.getMyStatistics(user.getId())
        );
    }

    /** 🔥 특정 투표에서 내 참여 정보만 조회 */
@GetMapping("/{voteId}/my")
public ResponseEntity<MyParticipationResponse> getMyParticipation(
        @PathVariable Integer voteId,
        @AuthenticationPrincipal CustomUserDetails user
) {
    return ResponseEntity.ok(
            voteDetailService.getMyParticipationOnly(voteId, user.getId())
    );
}

/**
     * 📊 배당률/퍼센트 히스토리 차트
     */
    @GetMapping("/{voteId}/trend-chart")
public ResponseEntity<VoteTrendChartResponse> getTrendChart(
        @PathVariable Integer voteId
) {
    return ResponseEntity.ok(voteDetailService.loadTrendChart(voteId));
}

    /* =====================================================
       5️⃣ 투표 생성
       ===================================================== */

    /** 🔥 유저 투표 생성 */
    @PostMapping
    public ResponseEntity<?> createVoteByUser(
            @RequestBody UserVoteCreateRequest req,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(
                voteService.createVoteByUser(req, user.getId())
        );
    }

    /* =====================================================
   6️⃣ AI 투표 생성 (Python Worker / Admin)
   ===================================================== */

@PostMapping("/ai-create")
public ResponseEntity<?> createVoteByAI(
        @RequestBody VoteAiCreateRequest req
) {
    return ResponseEntity.ok(
            voteService.createVoteByAI(req)
    );
}
}
