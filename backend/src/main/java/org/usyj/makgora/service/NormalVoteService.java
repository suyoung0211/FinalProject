package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.*;
import org.usyj.makgora.repository.*;
import org.usyj.makgora.request.normalvote.NormalVoteCreateRequest;
import org.usyj.makgora.request.normalvote.NormalVoteFullUpdateRequest;
import org.usyj.makgora.response.normalvote.*;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NormalVoteService {

    private final NormalVoteRepository normalVoteRepository;
    private final NormalVoteOptionRepository optionRepository;
    private final NormalVoteChoiceRepository choiceRepository;
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

    vote.setTitle(req.getTitle());
    vote.setDescription(req.getDescription());
    vote.setEndAt(req.getEndAt());
    vote.setCategory(NormalVoteEntity.NormalCategory.valueOf(req.getCategory()));

    // 기존 옵션 전부 삭제 후 새로 생성
    optionRepository.deleteAll(vote.getOptions());

    List<NormalVoteOptionEntity> newOptions = req.getOptions().stream()
            .map(o -> {
                NormalVoteOptionEntity option = NormalVoteOptionEntity.builder()
                        .normalVote(vote)
                        .optionTitle(o.getOptionTitle())
                        .build();
                optionRepository.save(option);

                List<NormalVoteChoiceEntity> choices = o.getChoices().stream()
                        .map(c -> NormalVoteChoiceEntity.builder()
                                .normalOption(option)
                                .choiceText(c.getChoiceText())
                                .build())
                        .toList();

                choiceRepository.saveAll(choices);
                option.setChoices(choices);
                return option;
            }).toList();

    vote.setOptions(newOptions);

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
                    .totalParticipants(
                            v.getOptions().stream()
                                    .flatMap(o -> o.getChoices().stream())
                                    .mapToInt(NormalVoteChoiceEntity::getParticipantsCount)
                                    .sum()
                    )
                    .build()
            )
            .toList();

    return NormalVoteListResponse.builder()
            .votes(items)
            .totalCount(items.size())
            .build();
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