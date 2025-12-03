    // src/main/java/org/usyj/makgora/controller/IssueController.java
    package org.usyj.makgora.controller;

    import lombok.RequiredArgsConstructor;
    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.*;
    import org.usyj.makgora.response.issue.IssueResponse;
    import org.usyj.makgora.response.issue.IssueWithVotesResponse;
    import org.usyj.makgora.response.vote.VoteResponse;
    import org.usyj.makgora.service.IssueService;
import org.usyj.makgora.service.VoteService;
import org.usyj.makgora.entity.IssueEntity;
import org.usyj.makgora.request.vote.VoteAiCreateRequest;
import org.usyj.makgora.request.vote.VoteCreateRequest;

import java.time.LocalDateTime;
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

    /** 🔹 단일 이슈 + 관련 투표 */
    @GetMapping("/{id}")
    public ResponseEntity<IssueWithVotesResponse> getIssue(@PathVariable Integer id) {
        return ResponseEntity.ok(issueService.getIssueWithVotes(id));
    }

    /** 🔹 특정 이슈의 투표 목록 */
    @GetMapping("/{id}/votes")
    public ResponseEntity<List<VoteResponse>> getVotesForIssue(@PathVariable Integer id) {
        return ResponseEntity.ok(issueService.getVotesForIssue(id));
    }

    /** 🔹 최신 이슈 */
    @GetMapping("/latest")
    public ResponseEntity<List<IssueResponse>> getLatestIssues() {
        return ResponseEntity.ok(issueService.getLatestIssues(20));
    }

    /** 🔹 전체 이슈 + 투표 */
    @GetMapping("/with-votes")
    public ResponseEntity<List<IssueWithVotesResponse>> getAllIssuesWithVotes() {
        return ResponseEntity.ok(issueService.getAllIssuesWithVotes());
    }

    /** 🔥 투표 생성 */
    @PostMapping("/{issueId}/votes")
    public ResponseEntity<VoteResponse> createVote(
            @PathVariable Integer issueId,
            @RequestBody VoteCreateRequest req
    ) {
        return ResponseEntity.ok(issueService.createVote(issueId, req));
    }

    /** AI 자동 생성 투표 (파이썬이 호출하는 엔드포인트) */
    @PostMapping("/ai-create")
    public ResponseEntity<VoteResponse> createByAi(@RequestBody VoteAiCreateRequest req) {
        return ResponseEntity.ok(voteService.createVoteByAI(req));
    }

    /** 🔥 관리자: Issue 승인 + Vote 생성 */
    @PostMapping("/{issueId}/approve")
    public ResponseEntity<?> approveIssue(@PathVariable Integer issueId) {

        IssueEntity issue = issueService.approveIssue(issueId);

        VoteAiCreateRequest req = new VoteAiCreateRequest();
        req.setIssueId(issueId);
        req.setQuestion(issue.getAiSummary());   // 요약문이 투표 질문
        req.setResultType("YES_NO");             // 기본값
        req.setEndAt(LocalDateTime.now().plusDays(7));
        req.setInitialStatus("ONGOING");

        VoteResponse vote = voteService.createVoteByAI(req);

        return ResponseEntity.ok(vote);
    }
}

