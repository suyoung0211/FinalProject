package org.usyj.makgora.community.dto;

import java.time.LocalDateTime;

import org.usyj.makgora.entity.CommunityPostEntity;

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
public class CommunityPostResponse {

    private Long postId;
    private String title;
    private String content;
    private String postType;
    private String author;
    private String authorNickname;  // 프론트엔드 호환성을 위해 추가
    private Integer authorId;       // 작성자 ID 추가
    private LocalDateTime createdAt;
    private Integer recommendationCount; // 추천 수
    private Integer dislikeCount;        // 비추천 수
    private Integer commentCount;
    private Integer authorLevel;

    public static CommunityPostResponse fromEntity(CommunityPostEntity entity) {
        if (entity == null) {
            throw new IllegalArgumentException("Entity cannot be null");
        }
        
        if (entity.getUser() == null) {
            throw new IllegalStateException("User is null for post ID: " + entity.getPostId());
        }
        
        return CommunityPostResponse.builder()
                .postId(entity.getPostId())
                .title(entity.getTitle())
                .content(entity.getContent())
                .postType(entity.getPostType())
                .recommendationCount(entity.getRecommendationCount() != null ? entity.getRecommendationCount() : 0)
                .dislikeCount(entity.getDislikeCount() != null ? entity.getDislikeCount() : 0)
                .createdAt(entity.getCreatedAt())
                .author(entity.getUser().getNickname())
                .authorNickname(entity.getUser().getNickname())
                .authorId(entity.getUser().getId())
                .commentCount(entity.getComments() != null ? entity.getComments().size() : 0)  // 댓글 수 계산
                .authorLevel(entity.getUser().getLevel() != null ? entity.getUser().getLevel() : 1)  // 작성자 레벨 (기본값 1)
                .build();
    }
}
