// src/main/java/org/usyj/makgora/controller/IssueController.java
package org.usyj.makgora.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.response.issue.IssueResponse;
import org.usyj.makgora.response.vote.VoteResponse;
import org.usyj.makgora.service.IssueService;
import org.usyj.makgora.service.VoteService;
import org.usyj.makgora.entity.IssueEntity;
import org.usyj.makgora.request.vote.VoteAiCreateRequest;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;
    private final VoteService voteService;

    /** 🔹 AI 추천 이슈 목록 */
    @GetMapping("/recommended")
    public ResponseEntity<List<IssueResponse>> getRecommendedIssues() {
        return ResponseEntity.ok(issueService.getRecommendedIssues());
    }

    /** 🔹 최신 이슈 */
    @GetMapping("/latest")
    public ResponseEntity<List<IssueResponse>> getLatestIssues() {
        return ResponseEntity.ok(issueService.getLatestIssues(20));
    }

    /** 🔥 AI 자동 생성 투표 (Python Worker 전용) */
    @PostMapping("/ai-create")
    public ResponseEntity<VoteResponse> createVoteByAi(@RequestBody VoteAiCreateRequest req) {
        return ResponseEntity.ok(voteService.createVoteByAI(req));
    }

    /** 🔥 관리자: Issue 승인 (★ 여기서는 Vote 생성 절대 안 함) */
    @PostMapping("/{issueId}/approve")
public ResponseEntity<IssueResponse> approveIssue(@PathVariable Integer issueId) {

    IssueEntity issue = issueService.approveIssue(issueId);
    // Python + Redis 를 통해 비동기로 Vote 생성됨

    return ResponseEntity.ok(IssueResponse.from(issue));
}
}
