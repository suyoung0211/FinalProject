package org.usyj.makgora.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.RssArticleEntity;
import org.usyj.makgora.repository.ArticleCommentRepository;
import org.usyj.makgora.rssfeed.repository.RssArticleRepository;
import org.usyj.makgora.repository.ArticleReactionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RssArticleScoreService {

    private final RssArticleRepository articleRepo;
    private final ArticleCommentRepository commentRepo;
    private final ArticleReactionRepository reactionRepo;

    /**
     * 기사 AI 점수 계산 공식
     * - 조회수 0.1
     * - 좋아요 1.0
     * - 댓글수 2.0
     * - 댓글 좋아요 합 1.0
     */
    public int calculateScore(RssArticleEntity article) {

        Integer articleId = article.getId();

        long likeCount = reactionRepo.countLikes(articleId);
        long dislikeCount = reactionRepo.countDisLikes(articleId);

        long commentCount = commentRepo.countCommentsByArticle(articleId);
        long commentLikes = commentRepo.sumCommentLikesByArticle(articleId);

        double score =
                article.getViewCount() * 0.1 +
                (likeCount * 1.0) +
                (dislikeCount * 0.25) +
                commentCount * 2.0 +
                commentLikes * 1.0;

        return (int) score;
    }

    @Transactional
    public int updateScoreAndReturn(RssArticleEntity article) {
        int score = calculateScore(article);
        article.setAiSystemScore(score);
        articleRepo.save(article);
        return score;
    }
}
