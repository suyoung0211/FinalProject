package org.usyj.makgora.issue.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.issue.dto.request.IssueStatusUpdateRequest;
import org.usyj.makgora.issue.dto.response.AiIssueResponse;
import org.usyj.makgora.issue.service.IssueInfoService;
import org.usyj.makgora.issue.service.IssueStatusService;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueInfoController {

    private final IssueInfoService issueInfoService;
    private final IssueStatusService issueStatusService; // 추가

    /**
     * 모든 이슈 조회
     * GET /api/issues
     * 권한: 관리자(ADMIN) 또는 슈퍼 어드민(SUPER_ADMIN)만 접근 가능
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<AiIssueResponse>> getAllIssues() {
        List<AiIssueResponse> issues = issueInfoService.getAllIssues();
        return ResponseEntity.ok(issues);
    }

    /**
     * 이슈 승인/거절
     * POST /api/issues/status
     * 권한: 관리자(ADMIN) 또는 슈퍼 어드민(SUPER_ADMIN)만 접근 가능
     */
    @PostMapping("/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<AiIssueResponse> updateIssueStatus(@RequestBody IssueStatusUpdateRequest request) {
        AiIssueResponse updatedIssue = issueStatusService.updateStatus(request);
        return ResponseEntity.ok(updatedIssue);
    }
}
