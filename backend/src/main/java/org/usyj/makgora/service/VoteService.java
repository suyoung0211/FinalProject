package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.usyj.makgora.entity.IssueEntity;
import org.usyj.makgora.entity.VoteEntity;
import org.usyj.makgora.entity.VoteOptionEntity;
import org.usyj.makgora.repository.IssueRepository;
import org.usyj.makgora.repository.VoteOptionRepository;
import org.usyj.makgora.repository.VoteRepository;
import org.usyj.makgora.request.vote.VoteCreateRequest;
import org.usyj.makgora.response.vote.VoteDetailResponse;
import org.usyj.makgora.response.vote.VoteResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VoteService {

    private final VoteRepository voteRepository;
    private final IssueRepository issueRepository;
    private final VoteOptionRepository optionRepository;

    /** 특정 Issue에 Vote 생성 */
    public VoteResponse createVote(Integer issueId, VoteCreateRequest req, Long userId) {

        IssueEntity issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        VoteEntity vote = VoteEntity.builder()
                .issue(issue)
                .title(req.getTitle())
                .status(VoteEntity.Status.ONGOING)
                .endAt(LocalDateTime.parse(req.getEndAt()))
                .build();

        VoteEntity saved = voteRepository.save(vote);

        createYesNoOptions(saved);

        return toResponse(saved);
    }

    /** YES/NO 옵션 자동 생성 */
    private void createYesNoOptions(VoteEntity vote) {
        optionRepository.save(
                VoteOptionEntity.builder()
                        .vote(vote)
                        .optionTitle("YES")
                        .build()
        );
        optionRepository.save(
                VoteOptionEntity.builder()
                        .vote(vote)
                        .optionTitle("NO")
                        .build()
        );
    }

    /** 특정 Issue의 모든 Vote 검색 */
    public List<VoteResponse> getVotesByIssue(Integer issueId) {
        IssueEntity issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        return voteRepository.findByIssue(issue)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private VoteResponse toResponse(VoteEntity v) {
        return VoteResponse.builder()
                .id(v.getId())
                .issueId(v.getIssue().getId())
                .title(v.getTitle())
                .status(v.getStatus().name())
                .endAt(v.getEndAt())
                .totalPoints(v.getTotalPoints())
                .totalParticipants(v.getTotalParticipants())
                .build();
    }

    public VoteDetailResponse getVoteDetail(Integer voteId) {

    VoteEntity vote = voteRepository.findById(voteId)
            .orElseThrow(() -> new RuntimeException("Vote not found"));

    List<VoteOptionEntity> options =
            optionRepository.findAllWithChoicesByVoteId(vote.getId().longValue());

    List<VoteDetailResponse.OptionDto> optionDtos = options.stream()
            .map(o -> {
                var choice = (o.getChoices() != null && !o.getChoices().isEmpty())
                        ? o.getChoices().get(0)
                        : null;

                return VoteDetailResponse.OptionDto.builder()
                        .optionId(o.getId())
                        .optionTitle(o.getOptionTitle())
                        .pointsTotal(choice != null ? choice.getPointsTotal() : 0)
                        .participantsCount(choice != null ? choice.getParticipantsCount() : 0)
                        .odds(choice != null ? choice.getOdds() : null)
                        .build();
            })
            .collect(Collectors.toList());

    return VoteDetailResponse.builder()
            .id(vote.getId())
            .issueId(vote.getIssue().getId())
            .title(vote.getTitle())
            .status(vote.getStatus().name())
            .endAt(vote.getEndAt())
            .totalPoints(vote.getTotalPoints())
            .totalParticipants(vote.getTotalParticipants())
            .options(optionDtos)
            .build();
}

}
