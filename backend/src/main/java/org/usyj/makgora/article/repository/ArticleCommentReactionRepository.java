package org.usyj.makgora.article.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.usyj.makgora.article.entity.ArticleCommentReactionEntity;

public interface ArticleCommentReactionRepository
        extends JpaRepository<ArticleCommentReactionEntity, Long> {

    Optional<ArticleCommentReactionEntity> findByComment_IdAndUser_Id(Long commentId, Integer userId);

    long countByComment_IdAndReaction(Long commentId, Integer reaction);
}