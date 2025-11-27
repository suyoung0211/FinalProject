package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.IssueEntity;
import org.usyj.makgora.entity.RssArticleEntity;
import org.usyj.makgora.entity.VoteEntity;
import org.usyj.makgora.entity.VoteOptionEntity;
import org.usyj.makgora.repository.IssueRepository;
import org.usyj.makgora.rssfeed.repository.RssArticleRepository;
import org.usyj.makgora.repository.VoteOptionRepository;
import org.usyj.makgora.repository.VoteRepository;
import org.usyj.makgora.repository.VoteUserRepository;
import org.usyj.makgora.request.vote.IssueCreateRequest;
import org.usyj.makgora.response.vote.IssueArticleResponse;
import org.usyj.makgora.response.vote.IssueWithVotesResponse;
import org.usyj.makgora.response.vote.VoteOptionResultResponse;
import org.usyj.makgora.response.vote.VoteResponse;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IssueService {

    private final IssueRepository issueRepository;
    private final RssArticleRepository rssArticleRepository;
    private final VoteRepository voteRepository;
    private final VoteOptionRepository voteOptionRepository;
    private final VoteUserRepository voteUserRepository;

    /* ===========================================================
     * 1. 기사 기반 Issue 생성
     * =========================================================== */
    @Transactional
    public IssueArticleResponse createIssue(Integer articleId, IssueCreateRequest req, Integer userId) {

        RssArticleEntity article = rssArticleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found"));

        IssueEntity issue = IssueEntity.builder()
                .article(article)
                .title(req.getTitle())
                .thumbnail(article.getThumbnailUrl())   // 필드명 확인 필요
                .content(req.getContent())
                .source("RSS")                           // article.getSource() 삭제
                .build();

        issueRepository.save(issue);

        return IssueArticleResponse.from(issue);
    }

    /* ===========================================================
     * 2. 기사 기반 Issue 전체 조회
     * =========================================================== */
    @Transactional(readOnly = true)
    public List<IssueArticleResponse> getIssuesByArticle(Integer articleId) {

        RssArticleEntity article = rssArticleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found"));

        return issueRepository.findByArticle(article)
                .stream()
                .map(IssueArticleResponse::from)
                .collect(Collectors.toList());
    }

    /* ===========================================================
     * 3. 최신 Issue 조회
     * =========================================================== */
    @Transactional(readOnly = true)
    public List<IssueArticleResponse> getLatestIssues() {

        return issueRepository.findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(IssueArticleResponse::from)
                .collect(Collectors.toList());
    }

    /* ===========================================================
     * 4. VotePage용: Issue + Votes 묶음 전체 조회
     * =========================================================== */
    @Transactional(readOnly = true)
    public List<IssueWithVotesResponse> getIssuesWithVotes() {

        List<IssueEntity> issues = issueRepository.findAll();
        List<IssueWithVotesResponse> result = new ArrayList<>();

        for (IssueEntity issue : issues) {

            List<VoteEntity> votes = voteRepository.findByIssue(issue);

            List<VoteResponse> voteResponses = new ArrayList<>();
            for (VoteEntity vote : votes) {

                List<VoteOptionEntity> options = voteOptionRepository.findByVote(vote);

                List<VoteOptionResultResponse> optionResults =
                        buildOptionResults(options);

                long totalParticipants = voteUserRepository.countByVote(vote);

                voteResponses.add(VoteResponse.of(vote, optionResults, totalParticipants));
            }

            result.add(IssueWithVotesResponse.of(issue, voteResponses));
        }

        return result;
    }

    /* ===========================================================
     * 옵션별 count + percent
     * =========================================================== */
    private List<VoteOptionResultResponse> buildOptionResults(List<VoteOptionEntity> options) {

        List<VoteOptionResultResponse> results = new ArrayList<>();
        long totalCount = 0L;

        List<Long> counts = new ArrayList<>();
        for (VoteOptionEntity opt : options) {
            long c = voteUserRepository.countByOption(opt);
            counts.add(c);
            totalCount += c;
        }

        for (int i = 0; i < options.size(); i++) {
            VoteOptionEntity opt = options.get(i);
            long count = counts.get(i);

            int percent = (totalCount == 0)
                    ? 0
                    : (int) Math.round((double) count * 100 / totalCount);

            results.add(VoteOptionResultResponse.of(opt, count, percent));
        }

        return results;
    }

    @Transactional
public IssueEntity createUserIssue(String title, String description, Integer userId) {

    IssueEntity issue = IssueEntity.builder()
            .title(title)
            .content(description)
            .source("USER")
            .createdBy(IssueEntity.CreatedBy.USER)
            .build();

    return issueRepository.save(issue);
}
}
