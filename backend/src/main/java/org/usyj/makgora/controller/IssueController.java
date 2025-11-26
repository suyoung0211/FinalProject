package org.usyj.makgora.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.request.vote.IssueCreateRequest;
import org.usyj.makgora.response.vote.IssueResponse;
import org.usyj.makgora.security.CustomUserDetails;
import org.usyj.makgora.service.IssueService;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;

    /** 기사 기반 Issue 생성 */
    @PostMapping("/articles/{articleId}")
public ResponseEntity<IssueResponse> createIssue(
        @PathVariable Integer articleId,
        @AuthenticationPrincipal CustomUserDetails user,
        @RequestBody IssueCreateRequest req) {

    if (user == null) throw new RuntimeException("로그인이 필요합니다.");

    return ResponseEntity.ok(issueService.createIssue(articleId, req, user.getId()));
}

    /** 기사 기반 Issue 조회 */
    @GetMapping("/articles/{articleId}")
    public ResponseEntity<List<IssueResponse>> getIssuesByArticle(
            @PathVariable Integer articleId) {

        return ResponseEntity.ok(issueService.getIssuesByArticle(articleId));
    }

    /** 최근 이슈 조회 */
    @GetMapping("/latest")
    public ResponseEntity<List<IssueResponse>> getLatest() {
        return ResponseEntity.ok(issueService.getLatestIssues());
    }
}
