// src/main/java/org/usyj/makgora/controller/IssueController.java
package org.usyj.makgora.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.usyj.makgora.response.issue.IssueResponse;
import org.usyj.makgora.response.vote.VoteResponse;
import org.usyj.makgora.service.IssueService;
import org.usyj.makgora.service.VoteService;
import org.usyj.makgora.issue.entity.IssueEntity;
import org.usyj.makgora.issue.entity.IssueEntity.Status;
import org.usyj.makgora.issue.repository.IssueRepository;
import org.usyj.makgora.request.vote.VoteAiCreateRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;
    private final VoteService voteService;
    private final IssueRepository issueRepo;

    // 🔹 클래스 필드로 선언, Spring에서 application.properties 또는 환경변수로 주입
    @Value("${issue.card.url:http://localhost:5001/trigger/vote}")
    private String workerUrl;

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
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    @PostMapping("/ai-create")
    public ResponseEntity<VoteResponse> createVoteByAi(@RequestBody VoteAiCreateRequest req) {
        return ResponseEntity.ok(voteService.createVoteByAI(req));
    }

    /** 🔥 관리자: Issue 승인  */
    @PostMapping("/{issueId}/approve")
    public ResponseEntity<?> approveIssue(@PathVariable Integer issueId) {

        IssueEntity issue = issueRepo.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        issue.setStatus(Status.APPROVED);
        issue.setApprovedAt(LocalDateTime.now());
        issueRepo.save(issue);

        // 🔥 Python Worker에 Vote 생성 요청
        Map<String, Object> request = new HashMap<>();
        request.put("issueId", issueId);

        try {
            RestTemplate rest = new RestTemplate();
            rest.postForObject(workerUrl, request, String.class);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Vote 생성 Worker 호출 실패");
        }

        return ResponseEntity.ok("Issue Approved + Vote 생성 트리거됨");
    }
}
