package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.request.article.ArticleCommentRequest;
import org.usyj.makgora.response.article.ArticleCommentResponse;
import org.usyj.makgora.entity.ArticleCommentEntity;
import org.usyj.makgora.entity.RssArticleEntity;
import org.usyj.makgora.entity.UserEntity;
import org.usyj.makgora.repository.ArticleCommentRepository;
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

    /* ============================================================
       📌 1) 특정 기사 댓글 전체 조회 (Tree 구조)
       Controller에서 사용하는 공식 메서드
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

        // 전체 댓글 수 증가
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

        // 전체 댓글 수 감소
        RssArticleEntity article = comment.getArticle();
        article.setCommentCount(Math.max(0, article.getCommentCount() - 1));
        rssArticleRepository.save(article);

        articleCommentRepository.delete(comment);
    }


    /* ============================================================
       📌 공통: Entity → Response 변환
     ============================================================ */
    private ArticleCommentResponse toResponse(ArticleCommentEntity entity, Integer currentUserId) {

        boolean mine = (currentUserId != null)
                && entity.getUser().getId().equals(currentUserId);

        return ArticleCommentResponse.builder()
                .commentId(entity.getId())
                .articleId(entity.getArticle().getId())
                .parentCommentId(entity.getParent() != null ? entity.getParent().getId() : null)
                .userId(entity.getUser().getId())
                .nickname(entity.getUser().getNickname())
                .content(entity.getContent())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .likeCount(entity.getLikeCount() != null ? entity.getLikeCount() : 0)
                .dislikeCount(entity.getDislikeCount() != null ? entity.getDislikeCount() : 0)
                .mine(mine)
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

        // 1) Entity → DTO 1차 변환
        for (ArticleCommentEntity entity : entities) {
            ArticleCommentResponse dto = toResponse(entity, currentUserId);
            dtoMap.put(dto.getCommentId(), dto);
        }

        // 2) 트리 구조 생성
        List<ArticleCommentResponse> roots = new ArrayList<>();

        for (ArticleCommentEntity entity : entities) {
            Long commentId = entity.getId();
            Long parentId = (entity.getParent() != null)
                    ? entity.getParent().getId()
                    : null;

            ArticleCommentResponse current = dtoMap.get(commentId);

            if (parentId == null) {
                roots.add(current);
            } else {
                ArticleCommentResponse parent = dtoMap.get(parentId);
                if (parent != null) {
                    parent.getReplies().add(current);
                } else {
                    roots.add(current);
                }
            }
        }

        return roots;
    }
}
