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
    private Integer authorId;  // 작성자 ID 추가
    private LocalDateTime createdAt;
    private Integer recommendationCount; 
    private Integer commentCount; 
    private Integer authorLevel; 

    public static CommunityPostResponse fromEntity(CommunityPostEntity entity) {
        return CommunityPostResponse.builder()
                .postId(entity.getPostId())
                .title(entity.getTitle())
                .content(entity.getContent())
                .postType(entity.getPostType())
                .recommendationCount(entity.getRecommendationCount())
                .createdAt(entity.getCreatedAt())
                .author(entity.getUser().getNickname())
                .authorNickname(entity.getUser().getNickname())  // 프론트엔드 호환성
                .authorId(entity.getUser().getId())  // 작성자 ID
                .build();
    }
}
