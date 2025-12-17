package org.usyj.makgora.vote.dto.voteDetailResponse;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
// 통합 댓글 DTO
public class UnifiedCommentResponse {

    public enum CommentSource {
    ISSUE,      // 이슈 댓글
    COMMUNITY,  // 커뮤니티 댓글
    ARTICLE     // 기사 댓글
}

    private Long commentId;           // 공통: 댓글 ID
    private String content;           // 공통: 댓글 내용
    private String authorName;        // 공통: 작성자 이름
    private LocalDateTime createdAt;  // 공통: 작성 시간
    
    // 🔥 핵심: 어디서 온 댓글인지 구분
    private CommentSource source;     // ISSUE / COMMUNITY / ARTICLE
    private Long sourceId;            // 원본 ID (issue_id / post_id / article_id)
    private String sourceTitle;       // 원본 제목 (이슈 제목 / 게시글 제목 / 기사 제목)
    
    // 선택적 필드 (각 댓글 타입별로 다를 수 있음)
    private String position;          // 이슈 댓글만: 찬성/반대/중립
    private Integer likeCount;        // 커뮤니티/기사 댓글만
}


