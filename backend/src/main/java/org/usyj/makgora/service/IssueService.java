package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.usyj.makgora.entity.IssueEntity;
import org.usyj.makgora.entity.RssArticleEntity;
import org.usyj.makgora.repository.IssueRepository;
import org.usyj.makgora.rssfeed.repository.RssArticleRepository;
import org.usyj.makgora.request.vote.IssueCreateRequest;
import org.usyj.makgora.response.vote.IssueResponse;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IssueService {

    private final IssueRepository issueRepository;
    private final RssArticleRepository articleRepository;

    /** 기사 기반 이슈 생성 */
    public IssueResponse createIssue(Integer articleId, IssueCreateRequest req, Long userID) {

        RssArticleEntity article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found"));

        IssueEntity issue = IssueEntity.builder()
                .article(article)
                .title(req.getTitle())
                .content(req.getContent())
                .thumbnail(article.getThumbnailUrl())
                .source(article.getLink())
                .status(IssueEntity.Status.PENDING)
                .createdBy(IssueEntity.CreatedBy.ADMIN)
                .build();

        IssueEntity saved = issueRepository.save(issue);
        return toResponse(saved);
    }

    /** 기사 기반 이슈 조회 */
    public List<IssueResponse> getIssuesByArticle(Integer articleId) {
        RssArticleEntity article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found"));

        return issueRepository.findByArticle(article)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /** 최근 10개 이슈 */
    public List<IssueResponse> getLatestIssues() {
        return issueRepository.findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private IssueResponse toResponse(IssueEntity issue) {
        return IssueResponse.builder()
                .id(issue.getId())
                .articleId(issue.getArticle() != null ? issue.getArticle().getId() : null)
                .title(issue.getTitle())
                .content(issue.getContent())
                .thumbnail(issue.getThumbnail())
                .status(issue.getStatus().name())
                .createdAt(issue.getCreatedAt())
                .build();
    }
}
