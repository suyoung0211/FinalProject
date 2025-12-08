package org.usyj.makgora.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.request.vote.VoteParticipateRequest;
import org.usyj.makgora.request.voteDetails.VoteDetailResolveRequest;
import org.usyj.makgora.response.voteDetails.VoteDetailMainResponse;
import org.usyj.makgora.response.voteDetails.VoteDetailSettlementResponse;
import org.usyj.makgora.security.CustomUserDetails;
import org.usyj.makgora.service.VoteDetailService;
import org.usyj.makgora.service.VoteListService;
import org.usyj.makgora.service.VoteService;
import org.usyj.makgora.service.VoteSettlementService;
import org.usyj.makgora.request.vote.UserVoteCreateRequest;
import org.usyj.makgora.request.vote.VoteAiCreateRequest;


@RestController
@RequestMapping("/api/votes")
@RequiredArgsConstructor
public class VoteController {

    private final VoteService voteService;
    private final VoteListService votelistService;
    private final VoteSettlementService voteSettlementService;
    private final VoteDetailService voteDetailService; 

    /** 상세 조회 */
    @GetMapping("/{voteId}")
    public ResponseEntity<?> getVote(@PathVariable Integer voteId) {
        return ResponseEntity.ok(voteService.getVoteDetail(voteId));
    }

    /** 배당 조회 */
    @GetMapping("/{voteId}/odds")
    public ResponseEntity<?> getOdds(@PathVariable Integer voteId) {
        return ResponseEntity.ok(voteService.getOdds(voteId));
    }

    /** 목록 조회 */
    @GetMapping("/list")
    public ResponseEntity<?> getVoteList() {
        return ResponseEntity.ok(voteService.getVoteList());
    }

    /** 참여 */
    @PostMapping("/{voteId}/participate")
    public ResponseEntity<?> participate(
            @PathVariable Integer voteId,
            @RequestBody VoteParticipateRequest req,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(voteService.participateVote(voteId, req, user.getId()));
    }

    /** 🔥 내 참여만 취소 (vote_user_id 기반) */
    @PatchMapping("/my/{voteUserId}/cancel")
    public ResponseEntity<?> cancelMyVote(
            @PathVariable Long voteUserId,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(
                voteService.cancelMyVote(voteUserId, user.getId())
        );
    }

    // 내 참여 투표 상세정보
    @GetMapping("/my/statistics")
    public ResponseEntity<?> getMyStatistics(@AuthenticationPrincipal CustomUserDetails user) {
    return ResponseEntity.ok(voteService.getMyStatistics(user.getId()));
}

    /** 🔥 투표 취소 (사용자) */
    @PatchMapping("/{voteId}/cancel")
    public ResponseEntity<?> cancelVote(
            @PathVariable Integer voteId,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(
                voteService.cancelVote(voteId, user.getId())
        );
    }

    /** AI 자동 생성 */
    @PostMapping("/ai-create")
    public ResponseEntity<?> createByAi(@RequestBody VoteAiCreateRequest req) {
        return ResponseEntity.ok(voteService.createVoteByAI(req));
    }

    // 투표 종료
    @PatchMapping("/{voteId}/finish")
public ResponseEntity<?> finishVote(@PathVariable Integer voteId) {
    return ResponseEntity.ok(voteService.finishVote(voteId));
}

// 정답 결정
@PatchMapping("/{voteId}/resolve/{choiceId}")
public ResponseEntity<?> resolveVote(
        @PathVariable Integer voteId,
        @PathVariable Long choiceId
) {
    return ResponseEntity.ok(voteService.resolveVote(voteId, choiceId));
}

// 보상 분배
@PatchMapping("/{voteId}/reward")
public ResponseEntity<?> rewardVote(@PathVariable Integer voteId) {
    return ResponseEntity.ok(voteService.rewardVote(voteId));
}

@PostMapping("/create")
public ResponseEntity<?> createByUser(
        @RequestBody UserVoteCreateRequest req,
        @AuthenticationPrincipal CustomUserDetails user
) {
    if (user == null) return ResponseEntity.status(401).body("로그인이 필요합니다.");

    return ResponseEntity.ok(voteService.createVoteByUser(req, user.getId()));
}

// 내가 참여한 모든 투표 리스트 조회
@GetMapping("/my")
public ResponseEntity<?> getMyVotes(@AuthenticationPrincipal CustomUserDetails user) {
    return ResponseEntity.ok(voteService.getMyVotes(user.getId()));
}

/** 투표 상세 정보 전체 조회 */
    @GetMapping("/{voteId}/detail")
    public ResponseEntity<VoteDetailMainResponse> getVoteDetail(
            @PathVariable Integer voteId,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        Integer userId = (user != null) ? user.getId() : null;

        VoteDetailMainResponse response = votelistService.getVoteDetail(voteId, userId);

        return ResponseEntity.ok(response);
    }

    /** 내 참여 정보만 조회 */
@GetMapping("/{voteId}/my")
public ResponseEntity<?> getMyParticipation(
        @PathVariable Integer voteId,
        @AuthenticationPrincipal CustomUserDetails user
) {
    if (user == null) return ResponseEntity.status(401).body("로그인이 필요합니다.");

    return ResponseEntity.ok(
            voteDetailService.getMyParticipationOnly(voteId, user.getId())
    );
}

     /**
     * 🎯 정답 선택 + 정산 한 번에 수행
     * - METHOD: POST
     * - URL: /api/votes/{voteId}/resolve
     * - BODY: { "correctChoiceId": 123 }
     */
    @PostMapping("/{voteId}/resolve")
    public ResponseEntity<VoteDetailSettlementResponse> resolveAndSettle(
            @PathVariable Integer voteId,
            @RequestBody VoteDetailResolveRequest request,
            @AuthenticationPrincipal(expression = "id") Integer adminUserId
    ) {
        // 로그인된 유저를 adminUserId 로 세팅 (선택)
        request.setAdminUserId(adminUserId);

        VoteDetailSettlementResponse result =
                voteSettlementService.resolveAndSettle(voteId, request);

        return ResponseEntity.ok(result);
    }

    /**
     * 🎯 이미 correctChoice 가 설정된 투표를 다시 정산만 하고 싶을 때
     * - (필요 없으면 안 써도 됨)
     */
    @PostMapping("/{voteId}/settle")
    public ResponseEntity<VoteDetailSettlementResponse> settle(
            @PathVariable Integer voteId
    ) {
        VoteDetailSettlementResponse result =
                voteSettlementService.settle(voteId);
        return ResponseEntity.ok(result);
    }
}
