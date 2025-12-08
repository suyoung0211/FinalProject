package org.usyj.makgora.response.voteDetails;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.usyj.makgora.entity.NormalVoteCommentEntity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NormalVoteCommentResponse {

    private Long id;
    private Long userId;
    private String nickname;

    private String content;

    private Integer likeCount;
    private Integer dislikeCount;

    private Boolean isDeleted;

    private LocalDateTime createdAt;

    @Builder.Default
    private List<NormalVoteCommentResponse> children = new ArrayList<>();

    public static NormalVoteCommentResponse from(NormalVoteCommentEntity c) {
        return NormalVoteCommentResponse.builder()
                .id(c.getId())
                .userId(c.getUser().getId().longValue())
                .nickname(c.getUser().getNickname())
                .content(c.getContent())
                .likeCount(c.getLikeCount())
                .dislikeCount(c.getDislikeCount())
                .isDeleted(c.getIsDeleted())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
