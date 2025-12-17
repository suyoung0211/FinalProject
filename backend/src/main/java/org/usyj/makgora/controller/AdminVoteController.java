package org.usyj.makgora.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.global.security.CustomUserDetails;
import org.usyj.makgora.request.voteDetails.VoteDetailResolveRequest;
import org.usyj.makgora.response.voteDetails.VoteDetailSettlementResponse;
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

    @PostMapping("/{voteId}/finish-only")
public void finishOnly(@PathVariable Integer voteId) {
    voteSettlementService.finish(voteId);
}

    /** ✔ 정답 선택 + 즉시 정산 (정산 결과 반환) */
    @PostMapping("/{voteId}/resolve-and-settle")
    public ResponseEntity<VoteDetailSettlementResponse> resolveAndSettle(
            @PathVariable Integer voteId,
            @RequestBody VoteDetailResolveRequest req,
            @AuthenticationPrincipal CustomUserDetails admin
    ) {
        req.setAdminUserId(admin.getId());

        VoteDetailSettlementResponse result =
                voteSettlementService.finishAndSettle(voteId, req);

        return ResponseEntity.ok(result);
    }

    /** ✔ 이미 정답 설정된 투표 정산만 */
    @PostMapping("/{voteId}/settle")
    public VoteDetailSettlementResponse settle(
            @PathVariable Integer voteId
    ) {
        return voteSettlementService.settle(voteId);
    }

    /** ✔ REVIEWING → ONGOING */
    @PostMapping("/{voteId}/open")
    public ResponseEntity<?> openVote(
            @PathVariable Integer voteId
    ) {
        voteSettlementService.openVote(voteId);
        return ResponseEntity.ok(
                Map.of("message", "투표 상태가 REVIEWING → ONGOING 으로 변경되었습니다.")
        );
    }
}
