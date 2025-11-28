package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.IssueEntity;
import org.usyj.makgora.entity.VoteEntity;
import org.usyj.makgora.entity.VoteOptionChoiceEntity;
import org.usyj.makgora.entity.VoteOptionEntity;
import org.usyj.makgora.repository.*;
import org.usyj.makgora.request.vote.VoteCreateRequest;
import org.usyj.makgora.response.vote.VoteResponse;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VoteService {

    private final VoteRepository voteRepository;
    private final IssueRepository issueRepository;
    private final VoteOptionRepository optionRepository;
    private final VoteOptionChoiceRepository choiceRepository;

    /** 특정 Issue에 Vote 생성 */
    @Transactional
    public VoteResponse createVote(Integer issueId, VoteCreateRequest req) {

        IssueEntity issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        // Vote 생성
        VoteEntity vote = VoteEntity.builder()
                .issue(issue)
                .title(req.getTitle())
                .endAt(req.getEndAt())
                .status(VoteEntity.Status.ONGOING)
                .build();
        voteRepository.save(vote);

        List<VoteResponse.OptionResponse> optionResponses = new ArrayList<>();

        for (VoteCreateRequest.VoteOptionCreateRequest optReq : req.getOptions()) {

            // 옵션 생성
            VoteOptionEntity option = VoteOptionEntity.builder()
                    .vote(vote)
                    .optionTitle(optReq.getOptionTitle())
                    .startDate(optReq.getStartDate())
                    .endDate(optReq.getEndDate())
                    .build();
            optionRepository.save(option);

            List<VoteResponse.ChoiceResponse> choiceResponses = new ArrayList<>();

            for (String ch : optReq.getChoices()) {

                // 선택지 생성
                VoteOptionChoiceEntity choice = VoteOptionChoiceEntity.builder()
                        .option(option)
                        .choiceText(ch)
                        .pointsTotal(0)
                        .participantsCount(0)
                        .odds(null)
                        .build();

                choiceRepository.save(choice);

                choiceResponses.add(
                        VoteResponse.ChoiceResponse.builder()
                                .choiceId(choice.getId())      // Long → builder OK
                                .choiceText(choice.getChoiceText())
                                .pointsTotal(0)
                                .participantsCount(0)
                                .odds(null)
                                .build()
                );
            }

            optionResponses.add(
                    VoteResponse.OptionResponse.builder()
                            .optionId(option.getId())          // Long → builder OK
                            .optionTitle(option.getOptionTitle())
                            .choices(choiceResponses)
                            .build()
            );
        }

        return VoteResponse.builder()
                .voteId(vote.getId())
                .title(vote.getTitle())
                .endAt(vote.getEndAt())
                .options(optionResponses)
                .build();
    }

    /** Issue 기준 투표 목록 가져오기 */
    public List<VoteEntity> getVotesByIssue(IssueEntity issue) {
        return voteRepository.findByIssue(issue);
    }
}
