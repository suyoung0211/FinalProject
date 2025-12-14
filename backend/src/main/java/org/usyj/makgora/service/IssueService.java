// src/main/java/org/usyj/makgora/service/IssueService.java
package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.IssueEntity;
import org.usyj.makgora.repository.IssueRepository;
import org.usyj.makgora.response.issue.IssueResponse;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IssueService {

    private final IssueRepository issueRepository;
    private final StringRedisTemplate redis;   // 🔥 Redis 주입

    // 🆕 Vote 자동 생성을 위한 별도 큐
    private static final String VOTE_QUEUE = "VOTE_TRIGGER_QUEUE";

    /** 🔥 관리자 승인: Issue 상태 APPROVED + Vote 생성 트리거 push */
    @Transactional
    public IssueEntity approveIssue(Integer issueId) {

        IssueEntity issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        // ENUM 올바르게 설정
        issue.setStatus(IssueEntity.Status.APPROVED);
        issue.setApprovedAt(LocalDateTime.now());

        // save()는 IssueEntity를 반환 → 저장 후 다시 변수에 담아주는 것도 가능
        issue = issueRepository.save(issue);

        // Redis 플래그 체크
        String flagKey = "issue:" + issueId + ":voteCreated";
        String flag = redis.opsForValue().get(flagKey);

        if (!"1".equals(flag)) {
            redis.opsForList().leftPush("VOTE_TRIGGER_QUEUE", "issue:" + issueId);
            System.out.println("[ISSUE-APPROVE] Vote Queue push => issue:" + issueId);
        } else {
            System.out.println("[ISSUE-APPROVE] 이미 Vote 생성됨 → 큐 push 생략");
        }

        return issue;
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

    /** 🔹 최신 이슈 */
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
