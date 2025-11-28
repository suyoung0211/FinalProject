package org.usyj.makgora.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.CommunityPostEntity;
import org.usyj.makgora.community.repository.CommunityCommentRepository;
import org.usyj.makgora.community.repository.CommunityPostRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommunityPostScoreService {

    private final CommunityPostRepository postRepo;
    private final CommunityCommentRepository commentRepo;

    /**
     * 커뮤니티 게시글 점수 계산 공식
     * - 조회수 0.05
     * - 추천 2.0
     * - 비추천 -0.5
     * - 댓글수 2.0
     * - 댓글 좋아요 합 1.0
     */
    public int calculateScore(CommunityPostEntity post) {

        long commentLikes = commentRepo.sumLikeCountByPost(post.getPostId());

        double score =
                post.getViewCount() * 0.05 +
                post.getRecommendationCount() * 2.0 +
                post.getDislikeCount() * -0.5 +
                post.getCommentCount() * 2.0 +
                commentLikes * 1.0;

        return (int) score;
    }

    @Transactional
    public int updateScoreAndReturn(CommunityPostEntity post) {
        int score = calculateScore(post);
        post.setAiSystemScore(score);
        postRepo.save(post);
        return score;
    }
}
