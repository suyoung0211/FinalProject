package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.ArticleCommentEntity;
import org.usyj.makgora.entity.ArticleCommentReactionEntity;
import org.usyj.makgora.entity.UserEntity;
import org.usyj.makgora.repository.ArticleCommentReactionRepository;
import org.usyj.makgora.repository.ArticleCommentRepository;
import org.usyj.makgora.response.article.ArticleCommentReactionResponse;

@Service
@RequiredArgsConstructor
@Transactional
public class ArticleCommentReactionService {

    private final ArticleCommentRepository commentRepo;
    private final ArticleCommentReactionRepository reactionRepo;

    

    /** 👍 좋아요 */
    public ArticleCommentReactionResponse like(Long commentId, Integer userId) {

        ArticleCommentEntity comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글 없음"));

        // 유저의 이전 기록 조회
        Optional<ArticleCommentReactionEntity> existing =
                reactionRepo.findByComment_IdAndUser_Id(commentId, userId);

        if (existing.isPresent()) {
            ArticleCommentReactionEntity r = existing.get();

            // 이미 좋아요 상태면 → 좋아요 취소
            if (r.getReaction() == 1) {
                reactionRepo.delete(r);
            } else {
                // 싫어요 → 좋아요로 변경
                r.setReaction(1);
                reactionRepo.save(r);
            }

        } else {
            // 처음 누르는 경우
            ArticleCommentReactionEntity newR = ArticleCommentReactionEntity.builder()
                    .comment(comment)
                    .user(UserEntity.builder().id(userId).build())
                    .reaction(1)
                    .build();
            reactionRepo.save(newR);
        }

        return buildResponse(commentId, userId);
    }


    /** 👎 싫어요 */
    public ArticleCommentReactionResponse dislike(Long commentId, Integer userId) {

        ArticleCommentEntity comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글 없음"));

        Optional<ArticleCommentReactionEntity> existing =
                reactionRepo.findByComment_IdAndUser_Id(commentId, userId);

        if (existing.isPresent()) {
            ArticleCommentReactionEntity r = existing.get();

            if (r.getReaction() == -1) {
                // 이미 싫어요 → 취소
                reactionRepo.delete(r);
            } else {
                // 좋아요 → 싫어요로 변경
                r.setReaction(-1);
                reactionRepo.save(r);
            }

        } else {
            // 처음 누르는 경우
            ArticleCommentReactionEntity newR = ArticleCommentReactionEntity.builder()
                    .comment(comment)
                    .user(UserEntity.builder().id(userId).build())
                    .reaction(-1)
                    .build();
            reactionRepo.save(newR);
        }

        return buildResponse(commentId, userId);
    }


    /** JSON Response 만들기 */
    private ArticleCommentReactionResponse buildResponse(Long commentId, Integer userId) {

        long likeCnt = reactionRepo.countByComment_IdAndReaction(commentId, 1);
        long dislikeCnt = reactionRepo.countByComment_IdAndReaction(commentId, -1);

        boolean liked = reactionRepo.findByComment_IdAndUser_Id(commentId, userId)
                .map(r -> r.getReaction() == 1)
                .orElse(false);

        boolean disliked = reactionRepo.findByComment_IdAndUser_Id(commentId, userId)
                .map(r -> r.getReaction() == -1)
                .orElse(false);

        return ArticleCommentReactionResponse.builder()
        .commentId(commentId)
        .likeCount(likeCnt)
        .dislikeCount(dislikeCnt)
        .liked(liked)
        .disliked(disliked)
        .build();
    }

     /**
     * 🔥 단일 엔드포인트: LIKE / DISLIKE / RESET 처리
     */
    public ArticleCommentReactionResponse react(Long commentId, Long userId, int reactionValue) {

        ArticleCommentEntity comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글 없음"));

        Optional<ArticleCommentReactionEntity> existingOpt =
                reactionRepo.findByComment_IdAndUser_Id(commentId, userId.intValue());

        if (reactionValue == 0) {
            // RESET
            existingOpt.ifPresent(reactionRepo::delete);
        }
        else {
            if (existingOpt.isPresent()) {
                ArticleCommentReactionEntity r = existingOpt.get();

                if (r.getReaction() == reactionValue) {
                    // 같은 버튼 다시 누르면 → 취소
                    reactionRepo.delete(r);
                } else {
                    // 좋아요 ↔ 싫어요 변경
                    r.setReaction(reactionValue);
                    reactionRepo.save(r);
                }
            } else {
                // 첫 반응
                ArticleCommentReactionEntity newR = ArticleCommentReactionEntity.builder()
                        .comment(comment)
                        .user(UserEntity.builder().id(userId.intValue()).build())
                        .reaction(reactionValue)
                        .build();

                reactionRepo.save(newR);
            }
        }

        // 최신 count 계산
        long likeCount = reactionRepo.countByComment_IdAndReaction(commentId, 1);
        long dislikeCount = reactionRepo.countByComment_IdAndReaction(commentId, -1);

        boolean liked = reactionRepo.findByComment_IdAndUser_Id(commentId, userId.intValue())
                .map(r -> r.getReaction() == 1)
                .orElse(false);

        boolean disliked = reactionRepo.findByComment_IdAndUser_Id(commentId, userId.intValue())
                .map(r -> r.getReaction() == -1)
                .orElse(false);

        // 댓글 count 저장(캐싱 가능)
        comment.setLikeCount((int) likeCount);
        comment.setDislikeCount((int) dislikeCount);
        commentRepo.save(comment);

        return ArticleCommentReactionResponse.builder()
                .commentId(commentId)
                .likeCount(likeCount)
                .dislikeCount(dislikeCount)
                .liked(liked)
                .disliked(disliked)
                .build();
    }
}
