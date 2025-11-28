package org.usyj.makgora.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.RssArticleEntity;
import org.usyj.makgora.rssfeed.repository.RssArticleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RssArticleScoreService {

    private final RssArticleRepository articleRepo;

    public int calculateScore(RssArticleEntity article) {
        double score =
                article.getViewCount() * 0.1 +
                article.getLikeCount() * 2 +
                article.getCommentCount() * 3;

        return (int) score;
    }

    @Transactional
    public void updateScore(RssArticleEntity article) {
        int score = calculateScore(article);
        article.setAiSystemScore(score);
        articleRepo.save(article);
    }
}