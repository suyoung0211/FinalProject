// 프로필 -> 최근 활동(커뮤니티 활동 내역)
package org.usyj.makgora.profile.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RecentCommunityActivityResponse {

    public enum CommunityActivityType {
        POST, COMMENT
    }
    
    private Long activityId;            // 글이면 postId, 댓글이면 commentId
    private CommunityActivityType type; // POST / COMMENT
    private Long postId;                // 게시글로 이동할 때 필요
    private String postTitle;           // 게시글 제목
    private String contentPreview;      // 글/댓글 내용 일부
    private LocalDateTime createdAt;    // 정렬용
}