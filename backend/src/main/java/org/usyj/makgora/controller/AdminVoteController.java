package org.usyj.makgora.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.usyj.makgora.request.voteDetails.VoteDetailResolveRequest;
import org.usyj.makgora.response.voteDetails.VoteDetailSettlementResponse;
import org.usyj.makgora.service.VoteSettlementService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/votes")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
public class AdminVoteController {

    private final VoteSettlementService voteSettlementService;

    /** ✔ 정답 선택만 */
    @PostMapping("/{voteId}/resolve")
    public VoteDetailSettlementResponse resolve(
            @PathVariable Integer voteId,
            @RequestBody VoteDetailResolveRequest req
    ) {
        return voteSettlementService.resolve(voteId, req);
    }

    /** ✔ 정답 선택 + 즉시 정산 */
    @PostMapping("/{voteId}/resolve-and-settle")
    public VoteDetailSettlementResponse resolveAndSettle(
            @PathVariable Integer voteId,
            @RequestBody VoteDetailResolveRequest req
    ) {
        return voteSettlementService.resolveAndSettle(voteId, req);
    }

    /** ✔ 이미 정답 설정된 투표 정산만 */
    @PostMapping("/{voteId}/settle")
    public VoteDetailSettlementResponse settle(
            @PathVariable Integer voteId
    ) {
        return voteSettlementService.settle(voteId);
    }
}