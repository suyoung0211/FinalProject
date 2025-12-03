package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import org.usyj.makgora.entity.IssueEntity;
import org.usyj.makgora.repository.IssueRepository;
import org.usyj.makgora.response.issue.IssueResponse;
import org.usyj.makgora.response.issue.IssueWithVotesResponse;
import org.usyj.makgora.response.vote.VoteResponse;
import org.usyj.makgora.request.vote.VoteCreateRequest;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IssueService {

    private final IssueRepository issueRepository;
    private final VoteService voteService;

    /** 🔥 Python Worker 호출용 RestTemplate */
    private final RestTemplate restTemplate = new RestTemplate();

    private final String PYTHON_AI_URL = "http://localhost:8010/python/run-ai-vote/";

    // =====================================================================
    // 🔥 1) Issue 승인 → Python Worker로 "AI 기반 투표 생성" 요청
    // =====================================================================
    @Transactional
    public IssueEntity approveIssue(Integer issueId) {

        IssueEntity issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        issue.setStatus(IssueEntity.Status.APPROVED);
        issue.setApprovedAt(LocalDateTime.now());
        issueRepository.save(issue);

        // ---- Python Worker 호출 ----
        try {
            String url = PYTHON_AI_URL + issueId;
            restTemplate.postForObject(url, null, String.class);
            System.out.println("[AI-VOTE] Python Worker 호출 완료 → " + url);
        } catch (Exception e) {
            System.err.println("[AI-VOTE][ERROR] Python Worker 요청 실패: " + e.getMessage());
        }

        return issue;
    }

    // =====================================================================
    // 🔥 2) 직접 투표 생성 (관리자/사용자)
    // =====================================================================
    @Transactional
    public VoteResponse createVote(Integer issueId, VoteCreateRequest req) {
        return voteService.createVote(issueId, req);
    }

    // =====================================================================
    // 🔹 3) 특정 Issue의 투표 목록
    // =====================================================================
    @Transactional(readOnly = true)
    public List<VoteResponse> getVotesForIssue(Integer issueId) {
        return voteService.getVotesForIssue(issueId);
    }

    // =====================================================================
    // 🔹 4) AI 추천 이슈 목록
    // =====================================================================
    @Transactional(readOnly = true)
    public List<IssueResponse> getRecommendedIssues() {
        return issueRepository
                .findTop20ByCreatedByAndStatusOrderByCreatedAtDesc(
                        IssueEntity.CreatedBy.AI,
                        IssueEntity.Status.APPROVED
                )
                .stream()
                .map(IssueResponse::from)
                .toList();
    }

    // =====================================================================
    // 🔹 5) 단일 이슈 + 투표 목록
    // =====================================================================
    @Transactional(readOnly = true)
    public IssueWithVotesResponse getIssueWithVotes(Integer issueId) {

        IssueEntity issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        return new IssueWithVotesResponse(
                IssueResponse.from(issue),
                voteService.getVotesByIssue(issue)
        );
    }

    // =====================================================================
    // 🔹 6) 전체 이슈 + 투표
    // =====================================================================
    @Transactional(readOnly = true)
    public List<IssueWithVotesResponse> getAllIssuesWithVotes() {

        return issueRepository.findAll().stream()
                .map(i -> new IssueWithVotesResponse(
                        IssueResponse.from(i),
                        voteService.getVotesByIssue(i)
                ))
                .toList();
    }

    // =====================================================================
    // 🔹 7) 최신 이슈 목록
    // =====================================================================
    @Transactional(readOnly = true)
    public List<IssueResponse> getLatestIssues(int limit) {

        Pageable pageable = PageRequest.of(0, limit);

        return issueRepository
                .findByStatusOrderByCreatedAtDesc(IssueEntity.Status.APPROVED, pageable)
                .getContent()
                .stream()
                .map(IssueResponse::from)
                .toList();
    }
}
