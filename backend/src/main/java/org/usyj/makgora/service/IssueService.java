package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.IssueEntity;
import org.usyj.makgora.repository.IssueRepository;
import org.usyj.makgora.response.issue.IssueResponse;
import org.usyj.makgora.response.issue.IssueWithVotesResponse;
import org.usyj.makgora.response.vote.VoteResponse;
import org.usyj.makgora.request.vote.VoteCreateRequest;

import java.util.List;

@Service
@RequiredArgsConstructor
public class IssueService {

    private final IssueRepository issueRepository;
    private final VoteService voteService;

    /** 🔥 투표 생성 */
    @Transactional
    public VoteResponse createVote(Integer issueId, VoteCreateRequest req) {
        return voteService.createVote(issueId, req);
    }

    /** 🔹 특정 Issue의 투표 목록 */
    @Transactional(readOnly = true)
    public List<VoteResponse> getVotesForIssue(Integer issueId) {
        return voteService.getVotesForIssue(issueId);
    }

    /** 🔹 AI 추천 이슈 */
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

    /** 🔹 단일 이슈 + 투표 */
    @Transactional(readOnly = true)
    public IssueWithVotesResponse getIssueWithVotes(Integer issueId) {
        IssueEntity issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        return new IssueWithVotesResponse(
                IssueResponse.from(issue),
                voteService.getVotesByIssue(issue)
        );
    }

    /** 🔹 전체 이슈 + 투표 */
    @Transactional(readOnly = true)
    public List<IssueWithVotesResponse> getAllIssuesWithVotes() {
        return issueRepository.findAll().stream()
                .map(i -> getIssueWithVotes(i.getId()))
                .toList();
    }

    /** 🔹 최신 이슈 */
    @Transactional(readOnly = true)
    public List<IssueResponse> getLatestIssues(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return issueRepository
                .findByStatusOrderByCreatedAtDesc(IssueEntity.Status.APPROVED, pageable)
                .stream()
                .map(IssueResponse::from)
                .toList();
    }
}
