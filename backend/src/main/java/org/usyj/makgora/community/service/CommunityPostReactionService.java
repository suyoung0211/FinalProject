package org.usyj.makgora.community.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.community.dto.CommunityPostReactionResponse;
import org.usyj.makgora.community.repository.CommunityPostReactionRepository;
import org.usyj.makgora.community.repository.CommunityPostRepository;
import org.usyj.makgora.entity.CommunityPostEntity;
import org.usyj.makgora.entity.CommunityPostReactionEntity;
import org.usyj.makgora.entity.UserEntity;

@Service
@RequiredArgsConstructor
public class CommunityPostReactionService {

    private final CommunityPostRepository postRepository;
    private final CommunityPostReactionRepository reactionRepository;

    @Transactional
    public CommunityPostReactionResponse reactToPost(Long postId, UserEntity user, Integer reactionValue) {

        // 1) 게시글 조회
        CommunityPostEntity post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다. postId=" + postId));

        // 2) 기존 반응 조회
        CommunityPostReactionEntity existing = reactionRepository
                .findByPostAndUser(post, user)
                .orElse(null);

        int oldValue = (existing == null) ? 0 : existing.getReactionValue();
        int newValue = reactionValue; // 1, -1, 0

        // 3) 기존 값과 새 값이 같으면 아무 변화 없음
        if (oldValue == newValue) {
            return new CommunityPostReactionResponse(
                    post.getPostId(),
                    post.getRecommendationCount(),
                    post.getDislikeCount(),
                    oldValue
            );
        }

        // 4) 카운트 조정 (old → new)
        if (oldValue == 1) {
            post.setRecommendationCount(Math.max(0, post.getRecommendationCount() - 1));
        } else if (oldValue == -1) {
            post.setDislikeCount(Math.max(0, post.getDislikeCount() - 1));
        }

        if (newValue == 1) {
            post.setRecommendationCount(post.getRecommendationCount() + 1);
        } else if (newValue == -1) {
            post.setDislikeCount(post.getDislikeCount() + 1);
        }

        // 5) 반응 엔티티 생성/수정/삭제
        if (newValue == 0) {
            if (existing != null) {
                reactionRepository.delete(existing);
            }
        } else {
            if (existing == null) {
                CommunityPostReactionEntity created = CommunityPostReactionEntity.builder()
                        .post(post)
                        .user(user)
                        .reactionValue(newValue)
                        .build();
                reactionRepository.save(created);
            } else {
                existing.setReactionValue(newValue);
            }
        }

        return new CommunityPostReactionResponse(
                post.getPostId(),
                post.getRecommendationCount(),
                post.getDislikeCount(),
                newValue
        );
    }
}
