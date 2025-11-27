package org.usyj.makgora.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.request.vote.VoteCreateRequest;
import org.usyj.makgora.response.vote.VoteResponse;
import org.usyj.makgora.service.VoteService;

@RestController
@RequestMapping("/api/issues/{issueId}/votes")
@RequiredArgsConstructor
public class VoteController {

    private final VoteService voteService;

    @PostMapping("")
    public ResponseEntity<VoteResponse> createVote(
            @PathVariable Integer issueId,
            @RequestBody VoteCreateRequest req
    ) {
        return ResponseEntity.ok(voteService.createVote(issueId, req));
    }
}