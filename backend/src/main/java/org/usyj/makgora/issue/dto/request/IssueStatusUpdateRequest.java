package org.usyj.makgora.issue.dto.request;

import lombok.*;

/**
 * 🔹 프론트엔드에서 승인/거절 버튼 클릭 시 요청 바디
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueStatusUpdateRequest {

    private Integer issueId; // 상태를 변경할 이슈 ID
    private String status;    // "APPROVED" 또는 "REJECTED"
}