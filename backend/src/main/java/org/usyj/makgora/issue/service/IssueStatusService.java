package org.usyj.makgora.issue.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.IssueEntity;
import org.usyj.makgora.issue.dto.IssueResponse;
import org.usyj.makgora.issue.dto.IssueStatusUpdateRequest;
import org.usyj.makgora.repository.IssueRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class IssueStatusService {

    private final IssueRepository issueRepository;

    /**
     * 🔹 이슈 승인/거절 + 시간 기록 후 IssueResponse 반환
     */
    @Transactional
    public IssueResponse updateStatus(IssueStatusUpdateRequest request) {
        IssueEntity issue = issueRepository.findById(request.getIssueId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 이슈 ID: " + request.getIssueId()));

        if ("APPROVED".equalsIgnoreCase(request.getStatus())) {
            issue.setStatus(IssueEntity.Status.APPROVED);  // Enum이면 이렇게
            issue.setApprovedAt(LocalDateTime.now());
            issue.setRejectedAt(null);
        } else if ("REJECTED".equalsIgnoreCase(request.getStatus())) {
            issue.setStatus(IssueEntity.Status.REJECTED);
            issue.setRejectedAt(LocalDateTime.now());
            issue.setApprovedAt(null);
        } else {
            throw new IllegalArgumentException("지원하지 않는 상태: " + request.getStatus());
        }

        issueRepository.save(issue);

        // IssueResponse DTO 변환 후 반환
        return IssueResponse.fromEntity(issue);
    }
}
