package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.RssArticleEntity;
import org.usyj.makgora.rssfeed.repository.RssArticleRepository;

@Service
@RequiredArgsConstructor
public class IssueTriggerService {

    private final RssArticleRepository articleRepository;
    private final AiIssueService aiIssueService;

    private static final double THRESHOLD = 20.0;

    private double calcScore(RssArticleEntity a) {
        return (a.getViewCount() * 0.2)
             + (a.getCommentCount() * 1.0)
             + (a.getLikeCount() * 1.5);
    }

    @Transactional
    public void checkIssueCreation(RssArticleEntity article) {
        // 이미 Issue 생성된 기사면 패스
        if (Boolean.TRUE.equals(article.getIssueCreated())) {
            return;
        }

        double score = calcScore(article);

        if (score >= THRESHOLD) {
            // Python AI Issue 생성 호출
            aiIssueService.triggerAiIssueGeneration();

            // 중복 생성 방지
            article.setIssueCreated(true);
            articleRepository.save(article);

            System.out.println("[IssueTrigger] Issue auto-created for articleId = " + article.getId());
        }
    }
}
