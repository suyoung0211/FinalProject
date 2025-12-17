package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.usyj.makgora.ranking.entity.*;
import org.usyj.makgora.repository.*;
import org.usyj.makgora.request.normalvote.NormalVoteCreateRequest;
import org.usyj.makgora.request.normalvote.NormalVoteFullUpdateRequest;
import org.usyj.makgora.response.normalvote.*;
import org.usyj.makgora.response.voteDetails.NormalVoteResultResponse;
import org.usyj.makgora.user.entity.UserEntity;
import org.usyj.makgora.user.repository.UserRepository;
import org.usyj.makgora.vote.entity.NormalVoteChoiceEntity;
import org.usyj.makgora.vote.entity.NormalVoteEntity;
import org.usyj.makgora.vote.entity.NormalVoteOptionEntity;
import org.usyj.makgora.vote.entity.NormalVoteStatusHistoryEntity;
import org.usyj.makgora.vote.entity.VoteUserEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Slf4j
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
public NormalVoteResponse getDetail(Integer id, Integer userId) {

    NormalVoteEntity vote = normalVoteRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("투표를 찾을 수 없습니다."));

    NormalVoteResponse.MyParticipationResponse myParticipation =
    (userId == null)
        ? null
        : voteUserRepository
            .findByNormalVote_IdAndUser_Id(id.longValue(), userId)
            .map(vu -> NormalVoteResponse.MyParticipationResponse.builder()
                .hasParticipated(true)
                .optionId(vu.getNormalOption().getId())
                .choiceId(vu.getNormalChoice().getId())
                .votedAt(vu.getCreatedAt())
                .build()
            )
            .orElse(null);

    NormalVoteResponse res = toResponse(vote);
    res.setMyParticipation(myParticipation);
    return res;
}
    /* ============================================================
   3) 전체 수정
   ============================================================ */
@Transactional
public NormalVoteResponse updateVote(Integer voteId, NormalVoteFullUpdateRequest req, Integer userId) {

    NormalVoteEntity vote = normalVoteRepository.findById(voteId)
            .orElseThrow(() -> new RuntimeException("투표를 찾을 수 없습니다."));

    // 🔥 관리자 권한 확인
    UserEntity user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("유저 정보를 찾을 수 없습니다."));

    boolean isAdmin = user.getRole() == UserEntity.Role.ADMIN
            || user.getRole() == UserEntity.Role.SUPER_ADMIN;

    if (!isAdmin && !vote.getUser().getId().equals(userId)) {
        throw new RuntimeException("본인이 생성한 투표만 수정할 수 있습니다.");
    }

    // 🔥 수정 가능한 항목 = 제목, 내용 ONLY
    if (req.getTitle() != null) vote.setTitle(req.getTitle());
    if (req.getDescription() != null) vote.setDescription(req.getDescription());

    vote.setUpdatedAt(LocalDateTime.now());
    normalVoteRepository.save(vote);

    return toResponse(vote);
}

    /* ============================================================
       4) 투표 참여
       ============================================================ */
    @Transactional
    public NormalVoteParticipateResponse participate(
            Integer voteId,
            Integer choiceId,
            Integer userId
    ) {
        log.info("🔥 [NORMAL VOTE PARTICIPATE] voteId={}, choiceId={}, userId={}",
                voteId, choiceId, userId);

        NormalVoteChoiceEntity choice = choiceRepository.findById(choiceId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "선택지를 찾을 수 없습니다."
                        )
                );

        NormalVoteOptionEntity option = choice.getNormalOption();
        NormalVoteEntity vote = option.getNormalVote();

        log.info("🔥 선택지에 연결된 voteId={}", vote.getId());

        voteUserRepository
                .findByNormalVote_IdAndUser_Id(voteId.longValue(), userId)
                .ifPresent(v -> {
                    log.warn("🚨 이미 일반투표 참여 기록 존재: voteUserId={}", v.getId());
                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "이미 일반투표에 참여했습니다."
                    );
                });

        if (!Objects.equals(vote.getId(), voteId.longValue())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "선택지가 해당 투표에 속하지 않습니다."
            );
        }

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "유저 정보를 찾을 수 없습니다."
                        )
                );

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

        choice.setParticipantsCount(
                (choice.getParticipantsCount() == null ? 0 : choice.getParticipantsCount()) + 1
        );
        choiceRepository.save(choice);

        log.info("✅ NORMAL VOTE 참여 완료: voteUserId={}, choiceId={}",
                vu.getId(), choice.getId());

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
        list.stream().map(v -> {

            int totalParticipants = v.getOptions().stream()
                    .flatMap(opt -> opt.getChoices().stream())
                    .mapToInt(c -> c.getParticipantsCount() != null ? c.getParticipantsCount() : 0)
                    .sum();

            return NormalVoteListItemResponse.builder()
                    .id(v.getId())
                    .title(v.getTitle())
                    .description(v.getDescription())
                    .status(v.getStatus().name())
                    .createdAt(v.getCreatedAt())
                    .endAt(v.getEndAt())
                    .totalParticipants(totalParticipants) // ✅ 여기!
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
                    .build();
        }).toList();

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

    @Transactional(readOnly = true)
public NormalVoteResponse getDetailForAdmin(Integer id) {
    NormalVoteEntity vote = normalVoteRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("투표를 찾을 수 없습니다."));
            normalVoteRepository.save(vote);
    return toResponse(vote);
};

@Transactional
public NormalVoteResponse finishVoteAdmin(Integer voteId) {
    NormalVoteEntity vote = normalVoteRepository.findById(voteId)
            .orElseThrow(() -> new RuntimeException("Vote not found"));

    vote.setStatus(NormalVoteEntity.Status.FINISHED);
    normalVoteRepository.save(vote);
    return toResponse(vote);
}



}
