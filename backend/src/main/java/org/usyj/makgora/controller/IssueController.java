package org.usyj.makgora.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.entity.IssueEntity;
import org.usyj.makgora.request.vote.IssueCreateRequest;
import org.usyj.makgora.request.vote.IssueCreateWithVoteRequest;
import org.usyj.makgora.request.vote.VoteCreateRequest;
import org.usyj.makgora.response.vote.IssueArticleResponse;
import org.usyj.makgora.response.vote.IssueWithVotesResponse;
import org.usyj.makgora.response.vote.VoteResponse;
import org.usyj.makgora.security.CustomUserDetails;
import org.usyj.makgora.service.IssueService;
import org.usyj.makgora.service.VoteService;

import jakarta.transaction.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;
    private final VoteService voteService;

    /** 기사 기반 Issue 생성 */
    @PostMapping("/articles/{articleId}")
public ResponseEntity<IssueArticleResponse> createIssue(
        @PathVariable Integer articleId,
        @AuthenticationPrincipal CustomUserDetails user,
        @RequestBody IssueCreateRequest req) {

    if (user == null) throw new RuntimeException("로그인이 필요합니다.");

    return ResponseEntity.ok(issueService.createIssue(articleId, req, user.getId()));
}

    /** 기사 기반 Issue 조회 */
    @GetMapping("/articles/{articleId}")
    public ResponseEntity<List<IssueArticleResponse>> getIssuesByArticle(
            @PathVariable Integer articleId) {

        return ResponseEntity.ok(issueService.getIssuesByArticle(articleId));
    }

    /** 최근 이슈 조회 */
    @GetMapping("/latest")
    public ResponseEntity<List<IssueArticleResponse>> getLatest() {
        return ResponseEntity.ok(issueService.getLatestIssues());
    }

     @GetMapping("/votes")
    public ResponseEntity<List<IssueWithVotesResponse>> getIssuesWithVotes() {
        return ResponseEntity.ok(issueService.getIssuesWithVotes());
    }

    @PostMapping("/create-with-vote")
@Transactional
public ResponseEntity<?> createIssueWithVote(
        @RequestBody IssueCreateWithVoteRequest req,
        @AuthenticationPrincipal CustomUserDetails user
) {
    Integer userId = user.getId();

    // 1) 이슈 생성
    IssueEntity issue = issueService.createUserIssue(
            req.getTitle(),
            req.getDescription(),
            userId    // ✔ category 제거, 올바른 인자만 전달
    );

    // 2) Vote 자동 생성
    VoteCreateRequest voteReq = new VoteCreateRequest();
    voteReq.setTitle(req.getTitle());
    voteReq.setType(VoteCreateRequest.VoteType.YESNO);
    voteReq.setOptions(List.of("YES", "NO"));
    voteReq.setEndAt(LocalDateTime.parse(req.getEndAt()));

    VoteResponse vote = voteService.createVote(issue.getId(), voteReq, userId);

    return ResponseEntity.ok(vote);
}

}
