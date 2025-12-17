// src/main/java/org/usyj/makgora/service/ArticleCommentReactionService.java
package org.usyj.makgora.article.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.article.dto.response.ArticleCommentReactionResponse;
import org.usyj.makgora.article.entity.ArticleCommentEntity;
import org.usyj.makgora.article.entity.ArticleCommentReactionEntity;
import org.usyj.makgora.article.repository.ArticleCommentReactionRepository;
import org.usyj.makgora.article.repository.ArticleCommentRepository;
import org.usyj.makgora.user.entity.UserEntity;
import org.usyj.makgora.user.repository.UserRepository;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class ArticleCommentReactionService {

    private final ArticleCommentRepository commentRepo;
    private final ArticleCommentReactionRepository reactionRepo;
    private final UserRepository userRepo;

    /**
     * reactionValue:
     *  1  = 좋아요
     * -1  = 싫어요
     *  0  = 내 반응 취소
     */
    public ArticleCommentReactionResponse react(Long commentId, Integer userId, int reactionValue) {

        if (userId == null) {
            throw new IllegalStateException("로그인이 필요합니다.");
        }

        ArticleCommentEntity comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다. id=" + commentId));

        UserEntity user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. id=" + userId));

        Optional<ArticleCommentReactionEntity> existingOpt =
                reactionRepo.findByComment_IdAndUser_Id(commentId, userId);

        if (reactionValue == 0) {
            // 단순 취소
            existingOpt.ifPresent(reactionRepo::delete);
        } else if (existingOpt.isEmpty()) {
            // 처음 반응
            ArticleCommentReactionEntity newReaction = ArticleCommentReactionEntity.builder()
                    .comment(comment)
                    .user(user)
                    .reaction(reactionValue)
                    .build();
            reactionRepo.save(newReaction);
        } else {
            // 이미 반응한 상태 → 토글 or 변경
            ArticleCommentReactionEntity existing = existingOpt.get();
            if (existing.getReaction() == reactionValue) {
                // 같은 버튼 한 번 더 누르면 취소
                reactionRepo.delete(existing);
            } else {
                // 좋아요 → 싫어요, 또는 싫어요 → 좋아요
                existing.setReaction(reactionValue);
                // JPA dirty checking으로 자동 update
            }
        }

        long likeCnt = reactionRepo.countByComment_IdAndReaction(commentId, 1);
        long dislikeCnt = reactionRepo.countByComment_IdAndReaction(commentId, -1);

        boolean liked = false;
        boolean disliked = false;

        Optional<ArticleCommentReactionEntity> myReactionOpt =
                reactionRepo.findByComment_IdAndUser_Id(commentId, userId);

        if (myReactionOpt.isPresent()) {
            int r = myReactionOpt.get().getReaction();
            liked = (r == 1);
            disliked = (r == -1);
        }

        return ArticleCommentReactionResponse.builder()
                .commentId(commentId)
                .likeCount(likeCnt)
                .dislikeCount(dislikeCnt)
                .liked(liked)
                .disliked(disliked)
                .build();
    }
}
