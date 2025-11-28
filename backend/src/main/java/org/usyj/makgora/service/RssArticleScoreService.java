package org.usyj.makgora.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.RssArticleEntity;
import org.usyj.makgora.repository.ArticleCommentRepository;
import org.usyj.makgora.rssfeed.repository.RssArticleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RssArticleScoreService {

    private final RssArticleRepository articleRepo;
    private final ArticleCommentRepository commentRepo;

    /**
     * 기사 AI 점수 계산 공식
     * - 조회수 0.1
     * - 좋아요 1.0
     * - 댓글수 2.0
     * - 댓글 좋아요 합 1.0
     */
    public int calculateScore(RssArticleEntity article) {

        long commentLikes = commentRepo.sumLikeCountByArticle(article.getId()); // 필요시 repo에 함수 생성

        double score =
                article.getViewCount() * 0.1 +
                article.getLikeCount() * 1.0 +
                article.getCommentCount() * 2.0 +
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
