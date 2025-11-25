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
                .build();
    }
}
