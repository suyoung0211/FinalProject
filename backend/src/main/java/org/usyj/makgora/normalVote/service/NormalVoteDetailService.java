package org.usyj.makgora.normalVote.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.normalVote.dto.response.NormalVoteDetailResponse;
import org.usyj.makgora.normalVote.entity.NormalVoteChoiceEntity;
import org.usyj.makgora.normalVote.entity.NormalVoteCommentEntity;
import org.usyj.makgora.normalVote.entity.NormalVoteEntity;
import org.usyj.makgora.normalVote.entity.NormalVoteOptionEntity;
import org.usyj.makgora.normalVote.repository.NormalVoteChoiceRepository;
import org.usyj.makgora.normalVote.repository.NormalVoteCommentRepository;
import org.usyj.makgora.normalVote.repository.NormalVoteOptionRepository;
import org.usyj.makgora.normalVote.repository.NormalVoteRepository;
import org.usyj.makgora.vote.dto.voteDetailResponse.VoteDetailCommentResponse;
import org.usyj.makgora.vote.dto.voteDetailResponse.VoteDetailParticipationResponse;
import org.usyj.makgora.vote.repository.VoteUserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NormalVoteDetailService {

    private final NormalVoteRepository normalVoteRepository;
    private final NormalVoteOptionRepository optionRepository;
    private final NormalVoteChoiceRepository choiceRepository;
    private final NormalVoteCommentRepository commentRepository;
    private final VoteUserRepository voteUserRepository;

    /** 일반 투표 상세 조회 */
    public NormalVoteDetailResponse getDetail(Integer normalVoteId, Integer userId) {

        // 1) 기본 투표 정보
        NormalVoteEntity vote = normalVoteRepository.findById(normalVoteId)
                .orElseThrow(() -> new RuntimeException("NormalVote not found"));

        // 2) 옵션 + 선택지 목록
        List<NormalVoteOptionEntity> options =
                optionRepository.findByNormalVote_Id(normalVoteId);

        int totalParticipants = options.stream()
                .flatMap(o -> o.getChoices().stream())
                .mapToInt(c -> c.getParticipantsCount())
                .sum();

        // 3) 댓글 트리
        List<NormalVoteCommentEntity> rootComments =
                commentRepository.findByNormalVote_IdAndParentIsNull(normalVoteId);

        List<VoteDetailCommentResponse> commentDtos = rootComments.stream()
                .map(this::convertComment)
                .toList();

        // 4) 내 참여 정보 (🔥 userId=null 허용)
        VoteDetailParticipationResponse myParticipation =
                loadMyParticipation(normalVoteId, userId);

        // 5) Response 조립
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
                                .map(opt -> NormalVoteDetailResponse.OptionDetail.builder()
                                        .optionId(opt.getId())
                                        .optionTitle(opt.getOptionTitle())
                                        .choices(
                                                opt.getChoices().stream()
                                                        .map(ch -> NormalVoteDetailResponse.ChoiceDetail.builder()
                                                                .choiceId(ch.getId())
                                                                .choiceText(ch.getChoiceText())
                                                                .participantsCount(ch.getParticipantsCount())
                                                                .build()
                                                        ).toList()
                                        )
                                        .build()
                                ).toList()
                )
                .myParticipation(myParticipation)
                .comments(commentDtos)
                .build();
    }

    /** 댓글 → DTO 변환 */
    private VoteDetailCommentResponse convertComment(NormalVoteCommentEntity c) {
        return VoteDetailCommentResponse.builder()
                .commentId(c.getId().intValue())
                .normalVoteId(c.getNormalVote().getId().intValue())
                .userId(c.getUser().getId())
                .username(c.getUser().getNickname())
                .content(Boolean.TRUE.equals(c.getIsDeleted()) ? "(삭제된 댓글입니다.)" : c.getContent())
                .likeCount(c.getLikeCount() != null ? c.getLikeCount() : 0)
                .dislikeCount(c.getDislikeCount() != null ? c.getDislikeCount() : 0)
                .parentId(c.getParent() != null ? c.getParent().getId().intValue() : null)
                .children(
                        c.getChildren() == null ? List.of()
                                : c.getChildren().stream().map(this::convertComment).toList()
                )
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }

    /** 🔥 userId가 null이어도 안전한 참여 조회 */
    private VoteDetailParticipationResponse loadMyParticipation(Integer normalVoteId, Integer userId) {

        if (userId == null) {
            return VoteDetailParticipationResponse.builder()
                    .hasParticipated(false)
                    .build();
        }

        return voteUserRepository
                .findByUserIdAndNormalVoteId(userId, normalVoteId)
                .map(v -> {

                    NormalVoteChoiceEntity choice = v.getNormalChoice();

                    return VoteDetailParticipationResponse.builder()
                            .hasParticipated(true)
                            .optionId(choice.getNormalOption().getId().intValue())
                            .choiceId(choice.getId().intValue())
                            .pointsBet(0)
                            .votedAt(v.getCreatedAt())
                            .expectedOdds(null)
                            .expectedReward(null)
                            .build();
                })
                .orElseGet(() ->
                        VoteDetailParticipationResponse.builder()
                                .hasParticipated(false)
                                .build()
                );
    }
}