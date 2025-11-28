// src/main/java/org/usyj/makgora/service/IssueService.java
package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.IssueEntity;
import org.usyj.makgora.repository.IssueRepository;
import org.usyj.makgora.response.issue.IssueResponse;
import org.usyj.makgora.response.issue.IssueWithVotesResponse;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IssueService {

    private final IssueRepository issueRepository;
    private final VoteService voteService;

    /** 🔹 AI가 생성한 추천 이슈 목록 */
    @Transactional(readOnly = true)
    public List<IssueResponse> getRecommendedIssues() {
        List<IssueEntity> issues = issueRepository
                .findTop30ByCreatedByAndStatusOrderByCreatedAtDesc(
                        IssueEntity.CreatedBy.AI,
                        IssueEntity.Status.APPROVED
                );

        return issues.stream()
                .map(IssueResponse::from)
                .collect(Collectors.toList());
    }

    /** (필요하면 그대로 유지) 이슈 + 투표 묶음 조회 */
    @Transactional(readOnly = true)
    public IssueWithVotesResponse getIssueWithVotes(Integer issueId) {
        IssueEntity issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        return new IssueWithVotesResponse(
                IssueResponse.from(issue),
                voteService.getVotesByIssue(issue)
        );
    }

    @Transactional(readOnly = true)
    public List<IssueWithVotesResponse> getAllIssuesWithVotes() {
        return issueRepository.findAll().stream()
                .map(i -> getIssueWithVotes(i.getId()))
                .collect(Collectors.toList());
    }
}
