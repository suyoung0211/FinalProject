package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.*;
import org.usyj.makgora.repository.*;
import org.usyj.makgora.request.normalvote.NormalVoteCreateRequest;
import org.usyj.makgora.request.normalvote.NormalVoteFullUpdateRequest;
import org.usyj.makgora.response.normalvote.*;
import org.usyj.makgora.response.voteDetails.NormalVoteResultResponse;
import org.usyj.makgora.response.voteDetails.VoteDetailCommentResponse;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NormalVoteService {

    private final NormalVoteRepository normalVoteRepository;
    private final NormalVoteOptionRepository optionRepository;
    private final NormalVoteChoiceRepository choiceRepository;
    private final NormalVoteStatusHistoryRepository normalVoteStatusHistoryRepository;
    private final UserRepository userRepository;
    private final VoteUserRepository voteUserRepository;
    private final VoteCommentRepository voteCommentRepository;

    /* ============================================================
       1) 일반투표 생성
       ============================================================ */
    @Transactional
    public NormalVoteResponse createVote(NormalVoteCreateRequest req, Integer userId) {

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 유저입니다."));

        NormalVoteEntity vote = NormalVoteEntity.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .endAt(req.getEndAt())
                .user(user)
                .category(NormalVoteEntity.NormalCategory.valueOf(req.getCategory()))
                .status(NormalVoteEntity.Status.ONGOING)
                .build();

        normalVoteRepository.save(vote);

        List<NormalVoteOptionEntity> options =
                req.getOptions().stream().map(opt -> {

                    NormalVoteOptionEntity option = NormalVoteOptionEntity.builder()
                            .normalVote(vote)
                            .optionTitle(opt.getOptionTitle())
                            .build();

                    optionRepository.save(option);

                    List<NormalVoteChoiceEntity> choices =
                            opt.getChoices().stream()
                                    .map(text -> NormalVoteChoiceEntity.builder()
                                            .normalOption(option)
                                            .choiceText(text)
                                            .build())
                                    .toList();

                    choiceRepository.saveAll(choices);
                    option.setChoices(choices);

                    return option;
                }).toList();

        vote.setOptions(options);

        normalVoteStatusHistoryRepository.save(
                NormalVoteStatusHistoryEntity.builder()
                        .normalVote(vote)
                        .status(NormalVoteStatusHistoryEntity.Status.ONGOING)
                        .statusDate(LocalDateTime.now())
                        .build()
        );

        return toResponse(vote);
    }

    /* ============================================================
       2) 상세 조회
       ============================================================ */
    @Transactional(readOnly = true)
    public NormalVoteResponse getDetail(Long id) {
        return toResponse(
                normalVoteRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("투표를 찾을 수 없습니다."))
        );
    }

    /* ============================================================
       3) 전체 수정
       ============================================================ */
    @Transactional
    public NormalVoteResponse updateVote(Long voteId, NormalVoteFullUpdateRequest req, Integer userId) {

        NormalVoteEntity vote = normalVoteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("투표를 찾을 수 없습니다."));

        if (!vote.getUser().getId().equals(userId))
            throw new RuntimeException("본인이 생성한 투표만 수정 가능합니다.");

        vote.setTitle(req.getTitle());
        vote.setDescription(req.getDescription());
        vote.setEndAt(req.getEndAt());
        vote.setCategory(NormalVoteEntity.NormalCategory.valueOf(req.getCategory()));

        // 삭제 옵션
        if (req.getDeletedOptionIds() != null)
            req.getDeletedOptionIds().forEach(optionRepository::deleteById);

        // 삭제 선택지
        if (req.getDeletedChoiceIds() != null)
            req.getDeletedChoiceIds().forEach(choiceRepository::deleteById);

        // 수정/추가 옵션
        for (NormalVoteFullUpdateRequest.OptionUpdateDto dto : req.getOptions()) {

            NormalVoteOptionEntity option;

            if (dto.getOptionId() != null) {
                option = optionRepository.findById(dto.getOptionId())
                        .orElseThrow(() -> new RuntimeException("옵션을 찾을 수 없습니다."));
                option.setOptionTitle(dto.getOptionTitle());
            } else {
                option = NormalVoteOptionEntity.builder()
                        .normalVote(vote)
                        .optionTitle(dto.getOptionTitle())
                        .build();
                optionRepository.save(option);
            }

            // 선택지 처리
            for (NormalVoteFullUpdateRequest.ChoiceUpdateDto c : dto.getChoices()) {

                if (c.getChoiceId() != null) {
                    NormalVoteChoiceEntity choice = choiceRepository.findById(c.getChoiceId())
                            .orElseThrow(() -> new RuntimeException("선택지를 찾을 수 없습니다."));
                    choice.setChoiceText(c.getChoiceText());
                } else {
                    choiceRepository.save(
                            NormalVoteChoiceEntity.builder()
                                    .normalOption(option)
                                    .choiceText(c.getChoiceText())
                                    .build()
                    );
                }
            }
        }

        return toResponse(vote);
    }

    /* ============================================================
       4) 투표 참여
       ============================================================ */
    @Transactional
    public NormalVoteResponse participate(Long voteId, Integer userId, Long choiceId) {

        NormalVoteEntity vote = normalVoteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("투표를 찾을 수 없습니다."));

        if (vote.getStatus() != NormalVoteEntity.Status.ONGOING)
            throw new RuntimeException("이미 종료된 투표입니다.");

        NormalVoteChoiceEntity choice = choiceRepository.findById(choiceId)
                .orElseThrow(() -> new RuntimeException("선택지를 찾을 수 없습니다."));

        // 중복 참가 방지
        VoteUserEntity existing = voteUserRepository.findByNormalVote_IdAndUser_Id(voteId, userId);
        if (existing != null)
            throw new RuntimeException("이미 참여한 투표입니다.");

        // 저장
        voteUserRepository.save(
                VoteUserEntity.builder()
                        .normalVote(vote)
                        .normalChoice(choice)
                        .user(userRepository.getReferenceById(userId))
                        .isCancelled(false)
                        .build()
        );

        // count 증가
        choice.setParticipantsCount(choice.getParticipantsCount() + 1);
        vote.setTotalParticipants(vote.getTotalParticipants() + 1);

        return toResponse(vote);
    }

    /* ============================================================
       5) 전체 조회
       ============================================================ */
    @Transactional(readOnly = true)
    public NormalVoteListResponse getAllVotes() {

        List<NormalVoteEntity> list = normalVoteRepository.findAll();

        List<NormalVoteListItemResponse> items =
                list.stream().map(v -> NormalVoteListItemResponse.builder()
                        .id(v.getId())
                        .title(v.getTitle())
                        .description(v.getDescription())
                        .status(v.getStatus().name())
                        .createdAt(v.getCreatedAt())
                        .endAt(v.getEndAt())
                        .totalParticipants(v.getTotalParticipants())
                        .options(
                                v.getOptions().stream()
                                        .map(opt -> NormalVoteOptionResponse.builder()
                                                .optionId(opt.getId())
                                                .title(opt.getOptionTitle())
                                                .choices(
                                                        opt.getChoices().stream()
                                                                .map(c -> NormalVoteChoiceResponse.builder()
                                                                        .choiceId(c.getId())
                                                                        .text(c.getChoiceText())
                                                                        .participantsCount(c.getParticipantsCount())
                                                                        .build())
                                                                .toList()
                                                )
                                                .build())
                                        .toList()
                        )
                        .build()
                ).toList();

        return NormalVoteListResponse.builder()
                .votes(items)
                .totalCount(items.size())
                .build();
    }

    /* ============================================================
       6) 투표 삭제 (CANCELLED)
       ============================================================ */
    @Transactional
    public void deleteVote(Long voteId, Integer userId) {

        NormalVoteEntity vote = normalVoteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("투표를 찾을 수 없습니다."));

        if (!vote.getUser().getId().equals(userId))
            throw new RuntimeException("본인이 생성한 투표만 삭제할 수 있습니다.");

        vote.setStatus(NormalVoteEntity.Status.CANCELLED);
    }

    /* ============================================================
       7) 투표 마감
       ============================================================ */
    @Transactional
    public String finishVote(Long voteId, Integer userId) {

        NormalVoteEntity vote = normalVoteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("투표를 찾을 수 없습니다."));

        if (!vote.getUser().getId().equals(userId))
            throw new RuntimeException("본인이 생성한 투표만 마감할 수 있습니다.");

        vote.setStatus(NormalVoteEntity.Status.FINISHED);

        return "NORMAL_VOTE_FINISHED";
    }

    /* ============================================================
       8) 투표 취소
       ============================================================ */
    @Transactional
    public String cancelVote(Long voteId, Integer userId) {

        NormalVoteEntity vote = normalVoteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("투표를 찾을 수 없습니다."));

        if (!vote.getUser().getId().equals(userId))
            throw new RuntimeException("본인이 생성한 투표만 취소할 수 있습니다.");

        vote.setStatus(NormalVoteEntity.Status.CANCELLED);

        return "NORMAL_VOTE_CANCELLED";
    }

    /* ============================================================
       9) 내가 참여한 투표 조회
       ============================================================ */
    @Transactional(readOnly = true)
    public List<NormalVoteListItemResponse> getMyParticipatedVotes(Integer userId) {

        List<VoteUserEntity> participated =
                voteUserRepository.findByUser_IdAndNormalVoteIsNotNull(userId);

        return participated.stream()
                .map(vu -> vu.getNormalVote())
                .distinct()
                .map(v -> NormalVoteListItemResponse.builder()
                        .id(v.getId())
                        .title(v.getTitle())
                        .status(v.getStatus().name())
                        .createdAt(v.getCreatedAt())
                        .endAt(v.getEndAt())
                        .totalParticipants(v.getTotalParticipants())
                        .build())
                .toList();
    }

    /* ============================================================
       10) 일반투표 결과 조회
       ============================================================ */
    @Transactional(readOnly = true)
    public NormalVoteResultResponse getResult(Long normalVoteId) {

        NormalVoteEntity vote =
                normalVoteRepository.findById(normalVoteId)
                        .orElseThrow(() -> new RuntimeException("투표가 없습니다."));

        List<NormalVoteOptionEntity> options =
                optionRepository.findByNormalVote_Id(normalVoteId);

        int totalParticipants =
                voteUserRepository.countByNormalVote_Id(normalVoteId);

        List<NormalVoteResultResponse.OptionResult> optionResults =
                options.stream().map(opt -> {

                    int count = voteUserRepository
                            .countByNormalChoice_NormalOption_Id(opt.getId());

                    double percent = totalParticipants == 0 ?
                            0.0 :
                            Math.round((count * 1000.0 / totalParticipants)) / 10.0;

                    return NormalVoteResultResponse.OptionResult.builder()
                            .optionId(opt.getId())
                            .title(opt.getOptionTitle())
                            .participants(count)
                            .percent(percent)
                            .build();
                }).toList();

        return NormalVoteResultResponse.builder()
                .normalVoteId(normalVoteId)
                .title(vote.getTitle())
                .status(vote.getStatus().name())
                .totalParticipants(totalParticipants)
                .options(optionResults)
                .build();
    }

    /* ============================================================
       내부 공통 매핑
       ============================================================ */
    private NormalVoteResponse toResponse(NormalVoteEntity v) {

    int commentCount = voteCommentRepository.countByNormalVote_Id(v.getId());

    // 🔥 댓글 루트 목록 조회
    List<VoteCommentEntity> roots = 
            voteCommentRepository.findByNormalVote_IdAndParentIsNull(v.getId());

    // 🔥 댓글 DTO 변환
    List<VoteDetailCommentResponse> comments =
            roots.stream()
                    .map(this::convertComment)
                    .toList();

    List<NormalVoteResponse.OptionResponse> options =
            v.getOptions().stream()
                    .map(o -> NormalVoteResponse.OptionResponse.builder()
                            .optionId(o.getId())
                            .optionTitle(o.getOptionTitle())
                            .choices(
                                    o.getChoices().stream()
                                            .map(c -> NormalVoteResponse.ChoiceResponse.builder()
                                                    .choiceId(c.getId())
                                                    .choiceText(c.getChoiceText())
                                                    .participantsCount(c.getParticipantsCount())
                                                    .build())
                                            .toList()
                            )
                            .build())
                    .toList();

    return NormalVoteResponse.builder()
            .id(v.getId())
            .title(v.getTitle())
            .description(v.getDescription())
            .category(v.getCategory().name())
            .status(v.getStatus().name())
            .totalParticipants(v.getTotalParticipants())
            .commentCount(commentCount)
            .comments(comments)   // 🔥 이제 정상 작동
            .endAt(v.getEndAt())
            .createdAt(v.getCreatedAt())
            .options(options)
            .build();
}

private VoteDetailCommentResponse convertComment(VoteCommentEntity e) {
    return VoteDetailCommentResponse.builder()
            .commentId(e.getCommentId().intValue())
            .normalVoteId(e.getNormalVote() != null ? e.getNormalVote().getId().intValue() : null)
            .userId(e.getUser().getId())
            .username(e.getUser().getNickname())
            .content(e.getContent())
            .position(e.getPosition())
            .likeCount(e.getLikeCount())
            .dislikeCount(e.getDislikeCount())
            .createdAt(e.getCreatedAt())
            .updatedAt(e.getUpdatedAt())
            .parentId(e.getParent() != null ? e.getParent().getCommentId().intValue() : null)
            .children(
                    e.getChildren().stream()
                            .map(this::convertComment)
                            .toList()
            )
            .build();
}
    
}
