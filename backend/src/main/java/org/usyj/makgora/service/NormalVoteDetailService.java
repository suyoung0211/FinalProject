package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.*;
import org.usyj.makgora.repository.*;
import org.usyj.makgora.response.voteDetails.VoteDetailCommentResponse;
import org.usyj.makgora.response.normalvote.NormalVoteDetailResponse;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NormalVoteDetailService {

    private final NormalVoteRepository normalVoteRepository;
    private final NormalVoteOptionRepository optionRepository;
    private final NormalVoteChoiceRepository choiceRepository;
    private final NormalVoteCommentRepository commentRepository;

    /**
     * 일반 투표 상세 조회 + 옵션 + 선택지 + 댓글 트리 포함
     */
    public NormalVoteDetailResponse getDetail(Integer normalVoteId) {

        // 🔥 1. 일반 투표 정보
        NormalVoteEntity vote = normalVoteRepository.findById(normalVoteId)
                .orElseThrow(() -> new RuntimeException("NormalVote not found"));

        // 🔥 2. 옵션 + 선택지
        List<NormalVoteOptionEntity> options =
                optionRepository.findByNormalVote_Id(normalVoteId);

        int totalParticipants = options.stream()
                .flatMap(o -> o.getChoices().stream())
                .mapToInt(c -> c.getParticipantsCount())
                .sum();

        // 🔥 3. 댓글 (루트 댓글만)
        List<NormalVoteCommentEntity> rootComments =
                commentRepository.findByNormalVote_IdAndParentIsNull(normalVoteId);

        // 🔥 4. 댓글 트리 변환
        List<VoteDetailCommentResponse> commentDtos =
                rootComments.stream()
                        .map(this::convertCommentTree)
                        .toList();

        // 🔥 5. 응답 조합
        return NormalVoteDetailResponse.builder()
                .id(vote.getId())
                .title(vote.getTitle())
                .description(vote.getDescription())
                .category(vote.getCategory() != null ? vote.getCategory().name() : null)
                .status(vote.getStatus().name())
                .endAt(vote.getEndAt())
                .createdAt(vote.getCreatedAt())
                .totalParticipants(totalParticipants)

                .options(
                        options.stream()
                                .map(opt ->
                                        NormalVoteDetailResponse.OptionDetail.builder()
                                                .optionId(opt.getId())
                                                .optionTitle(opt.getOptionTitle())
                                                .choices(
                                                        opt.getChoices().stream()
                                                                .map(choice ->
                                                                        NormalVoteDetailResponse.ChoiceDetail.builder()
                                                                                .choiceId(choice.getId())
                                                                                .choiceText(choice.getChoiceText())
                                                                                .participantsCount(choice.getParticipantsCount())
                                                                                .build()
                                                                ).toList()
                                                )
                                                .build()
                                ).toList()
                )

                .comments(commentDtos)
                .build();
    }

    /** =======================================================
     *  🔥 NormalVote 댓글 트리 변환 (재귀)
     * ======================================================= */
    private VoteDetailCommentResponse convertCommentTree(NormalVoteCommentEntity c) {

        List<VoteDetailCommentResponse> children =
                c.getChildren() == null ? List.of()
                        : c.getChildren().stream()
                        .map(this::convertCommentTree)
                        .toList();

        return VoteDetailCommentResponse.builder()
                .commentId(c.getId().intValue()) // Long → int
                .voteId(null)                    // NormalVote는 voteId 없음
                .normalVoteId(c.getNormalVote().getId().intValue())

                .userId(c.getUser().getId())
                .username(c.getUser().getNickname())

                .userPosition(null)
                .position(null)

                .content(Boolean.TRUE.equals(c.getIsDeleted())
                        ? "(삭제된 댓글입니다.)"
                        : c.getContent())

                .likeCount(c.getLikeCount() != null ? c.getLikeCount() : 0)
                .dislikeCount(c.getDislikeCount() != null ? c.getDislikeCount() : 0)

                // 투표 상세에서는 myLike/myDislike 계산하지 않음
                .myLike(false)
                .myDislike(false)

                .parentId(c.getParent() != null ? c.getParent().getId().intValue() : null)

                .children(children)

                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
