package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.*;
import org.usyj.makgora.repository.*;
import org.usyj.makgora.request.normalvote.NormalVoteCreateRequest;
import org.usyj.makgora.request.normalvote.NormalVoteFullUpdateRequest;
import org.usyj.makgora.response.normalvote.NormalVoteChoiceResponse;
import org.usyj.makgora.response.normalvote.NormalVoteListItemResponse;
import org.usyj.makgora.response.normalvote.NormalVoteListResponse;
import org.usyj.makgora.response.normalvote.NormalVoteOptionResponse;
import org.usyj.makgora.response.normalvote.NormalVoteResponse;

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

    /* ---------------------------------------------------
     * 투표 생성
     * --------------------------------------------------- */
    // 1) 생성
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

    // 옵션 + 선택지 저장
    List<NormalVoteOptionEntity> options = req.getOptions().stream()
            .map(opt -> {
                NormalVoteOptionEntity option = NormalVoteOptionEntity.builder()
                        .normalVote(vote)
                        .optionTitle(opt.getOptionTitle())
                        .build();
                optionRepository.save(option);

                List<NormalVoteChoiceEntity> choices = opt.getChoices().stream()
                        .map(c -> NormalVoteChoiceEntity.builder()
                                .normalOption(option)
                                .choiceText(c)
                                .build())
                        .toList();

                choiceRepository.saveAll(choices);
                option.setChoices(choices);
                return option;
            }).toList();

    vote.setOptions(options);

    /** 🔥 상태 이력 저장 */
    NormalVoteStatusHistoryEntity history = NormalVoteStatusHistoryEntity.builder()
            .normalVote(vote)
            .status(NormalVoteStatusHistoryEntity.Status.ONGOING)
            .statusDate(LocalDateTime.now())
            .build();

    normalVoteStatusHistoryRepository.save(history);

    return toResponse(vote);
}

// 2) 상세 조회
@Transactional(readOnly = true)
public NormalVoteResponse getDetail(Long id) {
    NormalVoteEntity vote = normalVoteRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("투표를 찾을 수 없습니다."));
    return toResponse(vote);
}

// 3) 업데이트 (리턴 타입도 NormalVoteResponse)
@Transactional
public NormalVoteResponse updateVote(Long voteId, NormalVoteFullUpdateRequest req, Integer userId) {

    NormalVoteEntity vote = normalVoteRepository.findById(voteId)
            .orElseThrow(() -> new RuntimeException("투표를 찾을 수 없습니다."));

    if (!vote.getUser().getId().equals(userId)) {
        throw new RuntimeException("본인이 생성한 투표만 수정 가능합니다.");
    }

    // 1) 기본 정보 수정
    vote.setTitle(req.getTitle());
    vote.setDescription(req.getDescription());
    vote.setEndAt(req.getEndAt());
    vote.setCategory(NormalVoteEntity.NormalCategory.valueOf(req.getCategory()));

    // 2) 삭제할 옵션들 처리
    if (req.getDeletedOptionIds() != null) {
        req.getDeletedOptionIds().forEach(optionRepository::deleteById);
    }

    // 3) 삭제할 choice들 처리
    if (req.getDeletedChoiceIds() != null) {
        req.getDeletedChoiceIds().forEach(choiceRepository::deleteById);
    }

    // 4) 옵션 업데이트 (기존 + 신규)
    for (NormalVoteFullUpdateRequest.OptionUpdateDto dto : req.getOptions()) {

        NormalVoteOptionEntity option;

        // 기존 옵션 수정
        if (dto.getOptionId() != null) {
            option = optionRepository.findById(dto.getOptionId())
                    .orElseThrow(() -> new RuntimeException("옵션을 찾을 수 없습니다."));
            option.setOptionTitle(dto.getOptionTitle());

        } else {
            // 새 옵션 추가
            option = NormalVoteOptionEntity.builder()
                    .normalVote(vote)
                    .optionTitle(dto.getOptionTitle())
                    .build();
            optionRepository.save(option);
        }

        // 선택지 업데이트
        for (NormalVoteFullUpdateRequest.ChoiceUpdateDto c : dto.getChoices()) {

            if (c.getChoiceId() != null) {
                // 기존 choice 수정
                NormalVoteChoiceEntity choice = choiceRepository.findById(c.getChoiceId())
                        .orElseThrow(() -> new RuntimeException("선택지를 찾을 수 없습니다."));
                choice.setChoiceText(c.getChoiceText());

            } else {
                // 새 choice 추가
                NormalVoteChoiceEntity choice = NormalVoteChoiceEntity.builder()
                        .normalOption(option)
                        .choiceText(c.getChoiceText())
                        .build();
                choiceRepository.save(choice);
            }
        }
    }

    return toResponse(vote);
}

// 4) 매핑 메서드: Entity → NormalVoteResponse
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
            .status(v.getStatus().name())
            .totalParticipants(v.getTotalParticipants())
            .endAt(v.getEndAt())
            .createdAt(v.getCreatedAt())
            .options(options)
            .build();
}

// 5) 전체 조회
@Transactional(readOnly = true)
public NormalVoteListResponse getAllVotes() {

    List<NormalVoteEntity> list = normalVoteRepository.findAll();

    List<NormalVoteListItemResponse> items = list.stream()
            .map(v -> NormalVoteListItemResponse.builder()
                    .id(v.getId())
                    .title(v.getTitle())
                    .description(v.getDescription())
                    .status(v.getStatus().name())
                    .createdAt(v.getCreatedAt())
                    .endAt(v.getEndAt())
                    .totalParticipants(v.getTotalParticipants())

                    /* 🔥 옵션 + 선택지 매핑 */
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
                                                                    .build()
                                                            )
                                                            .toList()
                                            )
                                            .build()
                                    )
                                    .toList()
                    )

                    .build()
            )
            .toList();

    return NormalVoteListResponse.builder()
            .votes(items)
            .totalCount(items.size())
            .build();
}

@Transactional
public NormalVoteResponse participate(Long voteId, Integer userId, Long choiceId) {

    UserEntity user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));

    NormalVoteEntity vote = normalVoteRepository.findById(voteId)
            .orElseThrow(() -> new RuntimeException("투표를 찾을 수 없습니다."));

    // -----------------------------
    // 🔥 선택지 찾기
    // -----------------------------
    NormalVoteChoiceEntity choice = choiceRepository.findById(choiceId)
            .orElseThrow(() -> new RuntimeException("선택지를 찾을 수 없습니다."));

    // -----------------------------
    // 🔥 중복 참여 방지 (필요 시 테이블 만들 수 있음)
    // -----------------------------
    // 나중에 NormalVoteUserHistory 테이블 만들면 여기서 체크 가능

    // -----------------------------
    // 🔥 개별 choice 참여 카운트 증가
    // -----------------------------
    choice.setParticipantsCount(choice.getParticipantsCount() + 1);
    choiceRepository.save(choice);

    // -----------------------------
    // 🔥 전체 투표 참여자 수 증가
    // -----------------------------
    vote.setTotalParticipants(vote.getTotalParticipants() + 1);
    normalVoteRepository.save(vote);

    return toResponse(vote);
}
// 6) 삭제(Soft Delete: 상태만 CANCELLED 로 변경)
@Transactional
public void deleteVote(Long voteId, Integer userId) {

    NormalVoteEntity vote = normalVoteRepository.findById(voteId)
            .orElseThrow(() -> new RuntimeException("투표를 찾을 수 없습니다."));

    if (!vote.getUser().getId().equals(userId)) {
        throw new RuntimeException("본인이 생성한 투표만 삭제할 수 있습니다.");
    }

    vote.setStatus(NormalVoteEntity.Status.CANCELLED);
}
}