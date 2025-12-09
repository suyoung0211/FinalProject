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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class NormalVoteService {

    private final NormalVoteRepository normalVoteRepository;
    private final NormalVoteOptionRepository optionRepository;
    private final NormalVoteChoiceRepository choiceRepository;
    private final NormalVoteStatusHistoryRepository normalVoteStatusHistoryRepository;
    private final UserRepository userRepository;
    private final VoteUserRepository voteUserRepository;
    
    // 🔥 댓글 분리 → VoteCommentRepository 제거

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
    public NormalVoteResponse getDetail(Integer id) {
        return toResponse(
                normalVoteRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("투표를 찾을 수 없습니다."))
        );
    }

    /* ============================================================
   3) 전체 수정
   ============================================================ */
@Transactional
public NormalVoteResponse updateVote(Integer voteId, NormalVoteFullUpdateRequest req, Integer userId) {

    NormalVoteEntity vote = normalVoteRepository.findById(voteId)
            .orElseThrow(() -> new RuntimeException("투표를 찾을 수 없습니다."));

    // 🔥 관리자 권한이면 수정 허용
    UserEntity user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("유저 정보를 찾을 수 없습니다."));

    boolean isAdmin = user.getRole() == UserEntity.Role.ADMIN
            || user.getRole() == UserEntity.Role.SUPER_ADMIN;

    // 🔥 owner가 아니고 관리자도 아니면 수정 금지
    if (!isAdmin && !vote.getUser().getId().equals(userId)) {
        throw new RuntimeException("본인이 생성한 투표만 수정 가능합니다.");
    }

    // 기본 정보 수정
    vote.setTitle(req.getTitle());
    vote.setDescription(req.getDescription());
    vote.setEndAt(req.getEndAt());
    vote.setCategory(NormalVoteEntity.NormalCategory.valueOf(req.getCategory()));

    /* ============================================================
       ✔ 옵션 삭제 처리 — 안전하게 검증 후 삭제
       ============================================================ */
    if (req.getDeletedOptionIds() != null) {
    for (Integer optionIdLong : req.getDeletedOptionIds()) {

        Integer optionId = optionIdLong.intValue(); // 🔥 Long → Integer 변환

        NormalVoteOptionEntity option = optionRepository.findById(optionId)
                .orElseThrow(() -> new RuntimeException("옵션을 찾을 수 없습니다."));

        if (!option.getNormalVote().getId().equals(voteId.longValue())) {
            throw new RuntimeException("해당 옵션은 이 투표에 속하지 않습니다.");
        }

        optionRepository.delete(option);
    }
}

    /* ============================================================
       ✔ 선택지 삭제 처리 — 안전하게 검증 후 삭제
       ============================================================ */
    if (req.getDeletedChoiceIds() != null) {
    for (Integer choiceIdLong : req.getDeletedChoiceIds()) {

        Integer choiceId = choiceIdLong.intValue(); // 🔥 Long → Integer 변환

        NormalVoteChoiceEntity choice = choiceRepository.findById(choiceId)
                .orElseThrow(() -> new RuntimeException("선택지를 찾을 수 없습니다."));

        if (!choice.getNormalOption().getNormalVote().getId().equals(voteId.longValue())) {
            throw new RuntimeException("해당 선택지는 이 투표에 속하지 않습니다.");
        }

        choiceRepository.delete(choice);
    }
}

    /* ============================================================
       ✔ 옵션 + 선택지 수정 및 추가 처리
       ============================================================ */
    for (NormalVoteFullUpdateRequest.OptionUpdateDto dto : req.getOptions()) {

        NormalVoteOptionEntity option;

        // 옵션 수정
        if (dto.getOptionId() != null) {
            option = optionRepository.findById(dto.getOptionId())
                    .orElseThrow(() -> new RuntimeException("옵션을 찾을 수 없습니다."));
            option.setOptionTitle(dto.getOptionTitle());

        } else {
            // 옵션 추가
            option = NormalVoteOptionEntity.builder()
                    .normalVote(vote)
                    .optionTitle(dto.getOptionTitle())
                    .build();
            optionRepository.save(option);
        }

        // 선택지 추가/수정
        for (NormalVoteFullUpdateRequest.ChoiceUpdateDto c : dto.getChoices()) {

            if (c.getChoiceId() != null) {
                // 기존 선택지 수정
                NormalVoteChoiceEntity choice = choiceRepository.findById(c.getChoiceId())
                        .orElseThrow(() -> new RuntimeException("선택지를 찾을 수 없습니다."));
                choice.setChoiceText(c.getChoiceText());

            } else {
                // 선택지 추가
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
public NormalVoteParticipateResponse participate(Integer voteId, Integer choiceId, Integer userId) {

    NormalVoteChoiceEntity choice = choiceRepository.findById(choiceId)
        .orElseThrow(() -> new RuntimeException("선택지를 찾을 수 없습니다."));

    NormalVoteOptionEntity option = choice.getNormalOption();
    NormalVoteEntity vote = option.getNormalVote();
    voteUserRepository.findByNormalVote_IdAndUser_Id(voteId, userId)
    .ifPresent(v -> {
        throw new RuntimeException("이미 일반투표에 참여했습니다.");
    });

    // 안전한 타입 비교
    if (!Objects.equals(vote.getId(), Long.valueOf(voteId))) {
        throw new RuntimeException("선택지가 해당 투표에 속하지 않습니다.");
    }

    UserEntity user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("유저 정보를 찾을 수 없습니다."));

    VoteUserEntity vu = VoteUserEntity.builder()
        .user(user)
        .normalVote(vote)
        .normalOption(option)
        .normalChoice(choice)
        .isCancelled(false)
        .createdAt(LocalDateTime.now())
        .updatedAt(LocalDateTime.now())
        .build();

    voteUserRepository.save(vu);

    choice.setParticipantsCount(choice.getParticipantsCount() + 1);
    choiceRepository.save(choice);

    return toParticipateResponse(vu);
}

private NormalVoteParticipateResponse toParticipateResponse(VoteUserEntity vu) {
    return NormalVoteParticipateResponse.builder()
            .voteId(vu.getNormalVote().getId())
            .optionId(vu.getNormalOption().getId())
            .choiceId(vu.getNormalChoice().getId())
            .userId(vu.getUser().getId())
            .participantsCount(vu.getNormalChoice().getParticipantsCount())
            .build();
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
    public void deleteVote(Integer voteId, Integer userId) {

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
    public String finishVote(Integer voteId, Integer userId) {

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
    public String cancelVote(Integer voteId, Integer userId) {

        NormalVoteEntity vote = normalVoteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("투표를 찾을 수 없습니다."));

        if (!vote.getUser().getId().equals(userId))
            throw new RuntimeException("본인이 생성한 투표만 취소할 수 있습니다.");

        vote.setStatus(NormalVoteEntity.Status.CANCELLED);

        return "NORMAL_VOTE_CANCELLED";
    }

     /* ============================================================
       8) 투표 취소(관리자용)
       ============================================================ */
    @Transactional
public void cancelVoteAdmin(Integer normalVoteId) {
    NormalVoteEntity vote = normalVoteRepository.findById(normalVoteId)
            .orElseThrow(() -> new RuntimeException("Vote not found"));

    vote.setStatus(NormalVoteEntity.Status.CANCELLED);  // ENUM 변경
    normalVoteRepository.save(vote);
}

    /* ============================================================
       9) 내가 참여한 투표 조회
       ============================================================ */
    @Transactional(readOnly = true)
    public List<NormalVoteListItemResponse> getMyParticipatedVotes(Integer userId) {

        List<VoteUserEntity> participated =
                voteUserRepository.findByUser_IdAndNormalVoteIsNotNull(userId);

        return participated.stream()
                .map(VoteUserEntity::getNormalVote)
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
    public NormalVoteResultResponse getResult(Integer normalVoteId) {

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
       내부 공통 매핑 (댓글 X)
       ============================================================ */
    private NormalVoteResponse toResponse(NormalVoteEntity v) {

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
                .endAt(v.getEndAt())
                .createdAt(v.getCreatedAt())
                .options(options)
                .build();
    }
}
