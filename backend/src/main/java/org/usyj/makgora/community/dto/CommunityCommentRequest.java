package org.usyj.makgora.community.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunityCommentRequest {
    private String content;
    private Long parentCommentId;  // null이면 일반 댓글, 값이 있으면 대댓글
}