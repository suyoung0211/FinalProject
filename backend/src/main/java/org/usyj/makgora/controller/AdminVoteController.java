package org.usyj.makgora.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.request.voteDetails.VoteDetailResolveRequest;
import org.usyj.makgora.response.voteDetails.VoteDetailSettlementResponse;
import org.usyj.makgora.security.CustomUserDetails;
import org.usyj.makgora.service.VoteSettlementService;

import lombok.RequiredArgsConstructor;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/votes")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
public class AdminVoteController {

    private final VoteSettlementService voteSettlementService;

    /** ✔ 정답 선택만 */
    @PostMapping("/{voteId}/finish")
    public VoteDetailSettlementResponse resolve(
            @PathVariable Integer voteId,
            @RequestBody VoteDetailResolveRequest req
    ) {
        return voteSettlementService.finished(voteId, req);
    }

    /** ✔ 정답 선택 + 즉시 정산 */
/** ✔ 정답 선택 + 즉시 정산 */
@PostMapping("/{voteId}/resolve-and-settle")
public ResponseEntity<?> resolveAndSettle(
        @PathVariable Integer voteId,
        @RequestBody VoteDetailResolveRequest req,
        @AuthenticationPrincipal CustomUserDetails admin
) {
    req.setAdminUserId(admin.getId());

    // 🔥 정답 확정 + 상태 FINISHED + 정산 → 한 번에 처리됨
    voteSettlementService.finishAndSettle(voteId, req);

    return ResponseEntity.ok(Map.of("message", "정답 확정 및 정산 완료"));
}

    /** ✔ 이미 정답 설정된 투표 정산만 */
    @PostMapping("/{voteId}/settle")
    public VoteDetailSettlementResponse settle(
            @PathVariable Integer voteId
    ) {
        return voteSettlementService.settle(voteId);
    }



    /** 🔥 NEW: REVIEWING → ONGOING 전환 API */
    @PostMapping("/{voteId}/open")
    public ResponseEntity<?> openVote(
            @PathVariable Integer voteId
    ) {
        voteSettlementService.openVote(voteId); // 서비스에서 구현한 메서드 호출
        return ResponseEntity.ok(Map.of("message", "투표 상태가 REVIEWING → ONGOING 으로 변경되었습니다."));
    }
}