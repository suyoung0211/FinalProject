package org.usyj.makgora.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.CommunityPostEntity;
import org.usyj.makgora.repository.CommunityPostRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommunityPostScoreService {

    private final CommunityPostRepository postRepo;

    public int calculateScore(CommunityPostEntity post) {
        double score =
                post.getViewCount() * 0.05 +
                post.getRecommendationCount() * 1.5 +
                post.getCommentCount() * 2;

        return (int) score;
    }

    @Transactional
    public void updateScore(CommunityPostEntity post) {
        int score = calculateScore(post);
        post.setAiSystemScore(score);
        postRepo.save(post);
    }
}