package org.usyj.makgora.community.dto.request;

import java.time.LocalDateTime;

import org.usyj.makgora.community.entity.CommunityPostEntity;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CommunityPostResponse {

    private Long postId;
    private String title;
    private String content;
    private String postType;

    private String author;
    private String authorNickname;
    private Integer authorId;
    private Integer authorLevel;

    private LocalDateTime createdAt;
    private LocalDateTime updateAt;

    private long recommendationCount;
    private long dislikeCount;
    private long commentCount;
    private long viewCount;

    // ❌ 이제 DB 값만 내려가는 fromEntity()는 금지
    public static CommunityPostResponse fromEntity(CommunityPostEntity entity) {
        throw new UnsupportedOperationException(
                "fromEntity()는 Redis 기반 구조와 충돌하므로 사용이 금지되었습니다. fromEntityWithCounts()를 사용하세요."
        );
    }

    // ✔ Redis 카운트 기반 응답
    public static CommunityPostResponse fromEntityWithCounts(
            CommunityPostEntity entity,
            long viewCount,
            long commentCount,
            long likeCount,
            long dislikeCount
    ) {
        return CommunityPostResponse.builder()
                .postId(entity.getPostId())
                .title(entity.getTitle())
                .content(entity.getContent())
                .postType(entity.getPostType())
                .author(entity.getUser().getNickname())
                .authorNickname(entity.getUser().getNickname())
                .authorId(entity.getUser().getId())
                .authorLevel(entity.getUser().getLevel())
                .createdAt(entity.getCreatedAt())
                .updateAt(entity.getUpdatedAt())
                .recommendationCount(likeCount)
                .dislikeCount(dislikeCount)
                .commentCount(commentCount)
                .viewCount(viewCount)
                .build();
    }
}
