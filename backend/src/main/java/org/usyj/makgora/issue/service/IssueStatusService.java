package org.usyj.makgora.issue.service;

import java.time.LocalDateTime;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.issue.dto.request.IssueStatusUpdateRequest;
import org.usyj.makgora.issue.dto.response.AiIssueResponse;
import org.usyj.makgora.issue.entity.IssueEntity;
import org.usyj.makgora.issue.repository.IssueRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class IssueStatusService {

    private final IssueRepository issueRepository;
    private final StringRedisTemplate redisTemplate;

    /**
     * 🔹 이슈 승인/거절 + 시간 기록 후 IssueResponse 반환
     */
    @Transactional
    public AiIssueResponse updateStatus(IssueStatusUpdateRequest request) {
        IssueEntity issue = issueRepository.findById(request.getIssueId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 이슈 ID: " + request.getIssueId()));

        if ("APPROVED".equalsIgnoreCase(request.getStatus())) {
            issue.setStatus(IssueEntity.Status.APPROVED);  // Enum이면 이렇게
            issue.setApprovedAt(LocalDateTime.now());
            issue.setRejectedAt(null);
            // 🔥 Redis 트리거
            String triggerKey = "issueApprove:" + issue.getId();
            redisTemplate.opsForList().leftPush("ISSUE_TRIGGER_QUEUE", triggerKey);
            System.out.println("🔥 Issue 승인 트리거 푸시 완료 → " + triggerKey);
        } else if ("REJECTED".equalsIgnoreCase(request.getStatus())) {
            issue.setStatus(IssueEntity.Status.REJECTED);
            issue.setRejectedAt(LocalDateTime.now());
            issue.setApprovedAt(null);
        } else {
            throw new IllegalArgumentException("지원하지 않는 상태: " + request.getStatus());
        }

        issueRepository.save(issue);

        // IssueResponse DTO 변환 후 반환
        return AiIssueResponse.fromEntity(issue);
    }
}
