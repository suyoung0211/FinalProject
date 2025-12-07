package org.usyj.makgora.issue.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.usyj.makgora.issue.dto.IssueResponse;
import org.usyj.makgora.repository.IssueRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class IssueInfoService {

    private final IssueRepository issueRepository;

    /**
     * 모든 이슈를 IssueResponse DTO로 반환
     * 변환 로직은 DTO 내부 fromEntity에서 처리
     */
    public List<IssueResponse> getAllIssues() {
        return issueRepository.findAllWithRelations()
                              .stream()
                              .map(IssueResponse::fromEntity)
                              .collect(Collectors.toList());
    }
}
