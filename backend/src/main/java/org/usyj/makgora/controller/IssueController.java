// src/main/java/org/usyj/makgora/controller/IssueController.java
package org.usyj.makgora.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.response.issue.IssueResponse;
import org.usyj.makgora.response.issue.IssueWithVotesResponse;
import org.usyj.makgora.service.IssueService;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;

    /** 🔹 AI 추천 이슈 목록 (메인/이슈페이지에서 사용) */
    @GetMapping("/recommended")
    public ResponseEntity<List<IssueResponse>> getRecommendedIssues() {
        return ResponseEntity.ok(issueService.getRecommendedIssues());
    }

    /** 🔹 단일 이슈 + 관련 투표 조회 */
    @GetMapping("/{id}")
    public ResponseEntity<IssueWithVotesResponse> getIssue(@PathVariable Integer id) {
        return ResponseEntity.ok(issueService.getIssueWithVotes(id));
    }

    /** 🔹 전체 이슈 + 투표 (관리자/디버그용) */
    @GetMapping("/with-votes")
    public ResponseEntity<List<IssueWithVotesResponse>> getAllIssuesWithVotes() {
        return ResponseEntity.ok(issueService.getAllIssuesWithVotes());
    }

    @GetMapping("/latest")
public ResponseEntity<List<IssueResponse>> getLatestIssues() {
    return ResponseEntity.ok(issueService.getLatestIssues(20));
}
}
