package org.usyj.makgora.article.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.usyj.makgora.article.entity.ArticleReactionEntity;
import org.usyj.makgora.article.entity.RssArticleEntity;
import org.usyj.makgora.user.entity.UserEntity;

import java.util.Optional;

public interface ArticleReactionRepository extends JpaRepository<ArticleReactionEntity, Long> {

    /** 특정 유저가 특정 기사에 남긴 반응 조회 */
    Optional<ArticleReactionEntity> findByArticleAndUser(RssArticleEntity article, UserEntity user);

    Optional<ArticleReactionEntity> findByArticleIdAndUserId(Integer articleId, Integer userId);
    
    /** 좋아요 개수 */
    @Query("SELECT COUNT(r) FROM ArticleReactionEntity r " +
           "WHERE r.article.id = :articleId AND r.reactionValue = 1")
    long countLikes(@Param("articleId") Integer articleId);

    /** 싫어요 개수 */
    @Query("SELECT COUNT(r) FROM ArticleReactionEntity r " +
           "WHERE r.article.id = :articleId AND r.reactionValue = -1")
    long countDisLikes(@Param("articleId") Integer articleId);
}
