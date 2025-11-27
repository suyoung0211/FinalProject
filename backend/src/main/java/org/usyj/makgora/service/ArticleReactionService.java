package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.RssArticleEntity;
import org.usyj.makgora.rssfeed.repository.RssArticleRepository;

@Service
@RequiredArgsConstructor
public class ArticleReactionService {

    private final RssArticleRepository articleRepository;
    private final IssueTriggerService issueTriggerService;

    @Transactional
    public void increaseViewCount(Integer articleId) {
        RssArticleEntity article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found"));

        article.setViewCount(article.getViewCount() + 1);
        articleRepository.save(article);

        issueTriggerService.checkIssueCreation(article);
    }

    @Transactional
    public void increaseLikeCount(Integer articleId) {
        RssArticleEntity article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found"));

        article.setLikeCount(article.getLikeCount() + 1);
        articleRepository.save(article);

        issueTriggerService.checkIssueCreation(article);
    }

    @Transactional
    public void increaseCommentCount(Integer articleId) {
        RssArticleEntity article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found"));

        article.setCommentCount(article.getCommentCount() + 1);
        articleRepository.save(article);

        issueTriggerService.checkIssueCreation(article);
    }
}
