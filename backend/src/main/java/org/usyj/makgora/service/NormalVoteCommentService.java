package org.usyj.makgora.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.VoteCommentEntity;
import org.usyj.makgora.repository.NormalVoteRepository;
import org.usyj.makgora.repository.VoteCommentRepository;
import org.usyj.makgora.response.voteDetails.VoteDetailCommentResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NormalVoteCommentService {

    private final VoteCommentRepository commentRepository;
    private final NormalVoteRepository normalVoteRepository;

    /* 🔵 일반투표 댓글 트리 조회 */
    @Transactional(readOnly = true)
    public List<VoteDetailCommentResponse> getComments(Long normalVoteId) {

        // 루트 댓글들만 가져오기 (parent == null)
        List<VoteCommentEntity> list =
                commentRepository.findByNormalVote_IdAndParentIsNull(normalVoteId);

        return list.stream()
                .map(this::convertComment)
                .toList();
    }

    /* 엔티티 → DTO 재귀 변환 */
    private VoteDetailCommentResponse convertComment(VoteCommentEntity c) {

        // 자식들 재귀 변환
        List<VoteDetailCommentResponse> children =
                (c.getChildren() == null)
                        ? List.of()
                        : c.getChildren().stream()
                        .map(this::convertComment)
                        .toList();

        Integer likeCount    = (c.getLikeCount()    != null) ? c.getLikeCount()    : 0;
        Integer dislikeCount = (c.getDislikeCount() != null) ? c.getDislikeCount() : 0;

        // 🔗 AI Vote 선택지 연결 (일반투표에선 보통 null)
        Integer linkedChoiceId = (c.getChoice() != null)
                ? c.getChoice().getId().intValue()
                : null;

        // 🔗 NormalVoteChoice 연결 필드(아직 엔티티에 normalChoice가 없으면 null 유지)
        Integer linkedNormalChoiceId = null; // 나중에 normalChoice 필드 추가하면 여기서 매핑

        return VoteDetailCommentResponse.builder()
                .commentId(c.getCommentId().intValue())
                .voteId(c.getVote() != null ? c.getVote().getId() : null)
                .normalVoteId(c.getNormalVote() != null ? c.getNormalVote().getId().intValue() : null)

                .userId(c.getUser().getId())
                .username(c.getUser().getNickname())
                .userPosition(c.getUserPosition())
                .position(c.getPosition())
                .content(c.getContent())

                .likeCount(likeCount)
                .dislikeCount(dislikeCount)
                .linkedChoiceId(linkedChoiceId)
                .linkedNormalChoiceId(linkedNormalChoiceId)

                .myLike(false)      // per-user 상태는 Redis/Reaction테이블 붙일 때 처리
                .myDislike(false)

                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())

                .parentId(c.getParent() != null ? c.getParent().getCommentId().intValue() : null)
                .children(children)
                .build();
    }
}
