package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.IssueEntity;
import org.usyj.makgora.entity.VoteEntity;
import org.usyj.makgora.entity.VoteOptionEntity;
import org.usyj.makgora.repository.IssueRepository;
import org.usyj.makgora.repository.VoteOptionRepository;
import org.usyj.makgora.repository.VoteRepository;
import org.usyj.makgora.repository.VoteUserRepository;
import org.usyj.makgora.request.vote.VoteCreateRequest;
import org.usyj.makgora.request.vote.VoteCreateRequest.VoteType;
import org.usyj.makgora.response.vote.*;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VoteService {

    private final VoteRepository voteRepository;
    private final IssueRepository issueRepository;
    private final VoteOptionRepository voteOptionRepository;
    private final VoteUserRepository voteUserRepository;

    /** Issue → Vote 생성 (YES/NO 또는 MULTI) */
    @Transactional
    public VoteResponse createVote(Integer issueId, VoteCreateRequest req, Long userId) {

        IssueEntity issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        VoteEntity vote = VoteEntity.builder()
                .issue(issue)
                .title(req.getTitle())
                .status(VoteEntity.Status.ONGOING)
                .endAt(req.getEndAt())
                .build();

        voteRepository.save(vote);

        // 옵션 생성
        if (req.getType() == VoteType.YESNO) {
            createYesNoOptions(vote);
        } else {
            createMultiOptions(vote, req.getOptions());
        }

        // 처음 생성 시에는 참여자가 없으므로 0 기준 응답
        List<VoteOptionEntity> options = voteOptionRepository.findByVote(vote);
        List<VoteOptionResultResponse> optionResults = buildOptionResults(options, vote);

        long totalParticipants = voteUserRepository.countByVote(vote);

        return VoteResponse.of(vote, optionResults, totalParticipants);
    }

    private void createYesNoOptions(VoteEntity vote) {
        VoteOptionEntity yes = VoteOptionEntity.builder()
                .vote(vote)
                .optionTitle("YES")
                .build();

        VoteOptionEntity no = VoteOptionEntity.builder()
                .vote(vote)
                .optionTitle("NO")
                .build();

        voteOptionRepository.save(yes);
        voteOptionRepository.save(no);
    }

    private void createMultiOptions(VoteEntity vote, List<String> options) {
        if (options == null || options.isEmpty()) return;

        for (String title : options) {
            VoteOptionEntity opt = VoteOptionEntity.builder()
                    .vote(vote)
                    .optionTitle(title)
                    .build();
            voteOptionRepository.save(opt);
        }
    }

    /** 특정 Issue의 Vote 목록 (요약) */
    @Transactional(readOnly = true)
    public List<VoteResponse> getVotesByIssue(Integer issueId) {

        IssueEntity issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        List<VoteEntity> votes = voteRepository.findByIssue(issue);
        List<VoteResponse> result = new ArrayList<>();

        for (VoteEntity vote : votes) {
            List<VoteOptionEntity> options = voteOptionRepository.findByVote(vote);
            List<VoteOptionResultResponse> optionResults = buildOptionResults(options, vote);
            long totalParticipants = voteUserRepository.countByVote(vote);
            result.add(VoteResponse.of(vote, optionResults, totalParticipants));
        }

        return result;
    }

    /** 투표 상세 (옵션 + 퍼센트 포함) */
    @Transactional(readOnly = true)
    public VoteDetailResponse getVoteDetail(Integer voteId) {

        VoteEntity vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("Vote not found"));

        List<VoteOptionEntity> options = voteOptionRepository.findByVote(vote);
        List<VoteOptionResultResponse> optionResults = buildOptionResults(options, vote);

        long totalParticipants = voteUserRepository.countByVote(vote);

        return VoteDetailResponse.of(vote, optionResults, totalParticipants);
    }

    /** 옵션별 count/percent 계산 공통 메서드 */
    private List<VoteOptionResultResponse> buildOptionResults(List<VoteOptionEntity> options, VoteEntity vote) {

        List<VoteOptionResultResponse> results = new ArrayList<>();
        long totalCount = 0L;

        // 미리 옵션별 count 계산
        List<Long> counts = new ArrayList<>();
        for (VoteOptionEntity opt : options) {
            long c = voteUserRepository.countByOption(opt);
            counts.add(c);
            totalCount += c;
        }

        for (int i = 0; i < options.size(); i++) {
            VoteOptionEntity opt = options.get(i);
            long count = counts.get(i);

            int percent = 0;
            if (totalCount > 0) {
                percent = (int) Math.round((double) count * 100.0 / totalCount);
            }

            results.add(VoteOptionResultResponse.of(opt, count, percent));
        }

        return results;
    }
}
