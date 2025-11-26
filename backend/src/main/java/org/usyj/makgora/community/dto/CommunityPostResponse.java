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

    // 작성자 정보
    private Integer authorId;
    private String authorNickname;

    private LocalDateTime createdAt;

    // 통계(있으면 사용, 없으면 null 가능)
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
                .authorId(entity.getUser().getId())              // ⭐ Integer
                .authorNickname(entity.getUser().getNickname())
                // commentCount, authorLevel은 나중에 필요하면 계산해서 넣어도 됨
                .build();
    }
}
