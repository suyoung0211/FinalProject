// src/main/java/org/usyj/makgora/service/ArticleCommentService.java
package org.usyj.makgora.article.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.article.dto.request.ArticleCommentRequest;
import org.usyj.makgora.article.dto.response.ArticleCommentResponse;
import org.usyj.makgora.article.entity.ArticleCommentEntity;
import org.usyj.makgora.article.entity.ArticleCommentReactionEntity;
import org.usyj.makgora.article.repository.ArticleCommentReactionRepository;
import org.usyj.makgora.article.repository.ArticleCommentRepository;
import org.usyj.makgora.entity.RssArticleEntity;
import org.usyj.makgora.entity.UserEntity;
import org.usyj.makgora.repository.UserRepository;
import org.usyj.makgora.rssfeed.repository.RssArticleRepository;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class ArticleCommentService {

    private final ArticleCommentRepository articleCommentRepository;
    private final RssArticleRepository rssArticleRepository;
    private final UserRepository userRepository;
    private final StringRedisTemplate redis;   // ✅ 추가
    private final ArticleReactionService reactionService;
    private final ArticleCommentReactionRepository reactionRepo;

    /* ============================================================
       📌 1) 특정 기사 댓글 전체 조회 (Tree 구조)
     ============================================================ */
    @Transactional(readOnly = true)
    public List<ArticleCommentResponse> getComments(Integer articleId, Integer currentUserId) {

        rssArticleRepository.findById(articleId)
                .orElseThrow(() -> new IllegalArgumentException("기사를 찾을 수 없습니다. id=" + articleId));

        List<ArticleCommentEntity> entities =
                articleCommentRepository.findByArticle_IdOrderByCreatedAtAsc(articleId);

        return buildCommentTree(entities, currentUserId);
    }

    

    /* ============================================================
       📌 2) 댓글 작성
     ============================================================ */
    public ArticleCommentResponse createComment(
            Integer articleId,
            Integer userId,
            ArticleCommentRequest request
    ) {

        RssArticleEntity article = rssArticleRepository.findById(articleId)
                .orElseThrow(() -> new IllegalArgumentException("기사를 찾을 수 없습니다. id=" + articleId));

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. id=" + userId));

        ArticleCommentEntity parent = null;
        if (request.getParentCommentId() != null) {
            parent = articleCommentRepository.findById(request.getParentCommentId())
                    .orElseThrow(() -> new IllegalArgumentException("부모 댓글을 찾을 수 없습니다."));

            if (!parent.getArticle().getId().equals(articleId)) {
                throw new IllegalStateException("부모 댓글이 해당 기사에 속해있지 않습니다.");
            }
        }

        ArticleCommentEntity entity = ArticleCommentEntity.builder()
                .article(article)
                .user(user)
                .parent(parent)
                .content(request.getContent())
                .build();

        ArticleCommentEntity saved = articleCommentRepository.save(entity);

        // 🔥 Redis 댓글 카운트 증가
    reactionService.addComment(articleId);

    // DB 카운트도 즉시 증가 (프론트 표시용)
    article.setCommentCount(article.getCommentCount() + 1);
    rssArticleRepository.save(article);


        return toResponse(saved, userId);
    }

    /* ============================================================
       📌 3) 댓글 수정
     ============================================================ */
    public ArticleCommentResponse updateComment(
            Long commentId,
            Integer userId,
            ArticleCommentRequest request
    ) {
        ArticleCommentEntity comment = articleCommentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다. id=" + commentId));

        if (!comment.getUser().getId().equals(userId)) {
            throw new IllegalStateException("본인이 작성한 댓글만 수정할 수 있습니다.");
        }

        comment.setContent(request.getContent());

        ArticleCommentEntity updated = articleCommentRepository.save(comment);
        return toResponse(updated, userId);
    }

    /* ============================================================
       📌 4) 댓글 삭제
     ============================================================ */
    public void deleteComment(Long commentId, Integer userId) {
    ArticleCommentEntity comment = articleCommentRepository.findById(commentId)
            .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다. id=" + commentId));

    if (!comment.getUser().getId().equals(userId)) {
        throw new IllegalStateException("본인이 작성한 댓글만 삭제할 수 있습니다.");
    }

    RssArticleEntity article = comment.getArticle();
    Integer articleId = article.getId();

    /* ============================================================
       🔥 1) Redis 댓글수 감소 처리 (음수 방지)
     ============================================================ */
    String redisKey = "article:" + articleId + ":comment";

    String val = redis.opsForValue().get(redisKey);
    long current = (val == null ? 0 : Long.parseLong(val));

    if (current > 0) {
        redis.opsForValue().increment(redisKey, -1);
    } else {
        redis.opsForValue().set(redisKey, "0");
    }

    /* ============================================================
       🔥 2) DB 댓글수 감소 (백업용)
     ============================================================ */
    article.setCommentCount(Math.max(0, article.getCommentCount() - 1));
    rssArticleRepository.save(article);

    /* ============================================================
       🔥 3) 댓글 본문 삭제(DB)
     ============================================================ */
    articleCommentRepository.delete(comment);
}

    /* ============================================================
       📌 공통: Entity → Response 변환
     ============================================================ */
    private ArticleCommentResponse toResponse(ArticleCommentEntity entity, Integer currentUserId) {

    Long commentId = entity.getId();

    long likeCnt = reactionRepo.countByComment_IdAndReaction(commentId, 1);
    long dislikeCnt = reactionRepo.countByComment_IdAndReaction(commentId, -1);

    boolean likedByMe = false;
    boolean dislikedByMe = false;

    if (currentUserId != null) {
        Optional<ArticleCommentReactionEntity> myReaction =
                reactionRepo.findByComment_IdAndUser_Id(commentId, currentUserId);

        if (myReaction.isPresent()) {
            likedByMe = myReaction.get().getReaction() == 1;
            dislikedByMe = myReaction.get().getReaction() == -1;
        }
    }

    return ArticleCommentResponse.builder()
            .commentId(commentId)
            .articleId(entity.getArticle().getId())
            .parentCommentId(entity.getParent() != null ? entity.getParent().getId() : null)
            .userId(entity.getUser().getId())
            .nickname(entity.getUser().getNickname())
            .avatarIcon(entity.getUser().getAvatarIcon())
            .profileFrame(entity.getUser().getProfileFrame())
            .content(entity.getContent())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .likeCount(likeCnt)
            .dislikeCount(dislikeCnt)
            .liked(likedByMe)
            .disliked(dislikedByMe)
            .mine(currentUserId != null && entity.getUser().getId().equals(currentUserId))
            .replies(new ArrayList<>())
            .build();
}



    /* ============================================================
       📌 댓글 트리 구조 생성 (대댓글 포함)
     ============================================================ */
    private List<ArticleCommentResponse> buildCommentTree(
        List<ArticleCommentEntity> entities,
        Integer currentUserId
) {

    Map<Long, ArticleCommentResponse> dtoMap = new LinkedHashMap<>();

    // 1) 모든 댓글을 DTO로 변환하여 map에 저장
    for (ArticleCommentEntity entity : entities) {
        dtoMap.put(entity.getId(), toResponse(entity, currentUserId));
    }

    // 2) 트리 만들기
    List<ArticleCommentResponse> roots = new ArrayList<>();

    for (ArticleCommentEntity entity : entities) {

        Long id = entity.getId();
        Long parentId = (entity.getParent() != null)
                ? entity.getParent().getId()
                : null;

        ArticleCommentResponse dto = dtoMap.get(id);

        if (parentId == null) {
            roots.add(dto); // 루트 댓글
        } else {
            ArticleCommentResponse parent = dtoMap.get(parentId);
            if (parent != null) {
                parent.getReplies().add(dto); // 부모에 자식 추가
            } else {
                roots.add(dto); // 부모가 사라진 edge-case
            }
        }
    }

    return roots;
}

}
