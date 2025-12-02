package org.usyj.makgora.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.usyj.makgora.entity.ArticleCommentEntity;

import java.util.List;

@Repository
public interface ArticleCommentRepository extends JpaRepository<ArticleCommentEntity, Long> {

    /**
     * 특정 기사에 달린 댓글들의 likeCount 합계
     */
    @Query("SELECT COALESCE(SUM(c.likeCount), 0) FROM ArticleCommentEntity c WHERE c.article.id = :articleId")
    long sumLikeCountByArticle(@Param("articleId") Integer articleId);

    /**
     * 특정 기사에 달린 댓글 목록
     */
    @Query("SELECT c FROM ArticleCommentEntity c WHERE c.article.id = :articleId ORDER BY c.createdAt DESC")
    List<ArticleCommentEntity> findByArticleIdOrderByCreatedAtDesc(@Param("articleId") Integer articleId);

    /**
     * 특정 유저가 작성한 댓글 목록
     */
    @Query("SELECT c FROM ArticleCommentEntity c WHERE c.user.id = :userId ORDER BY c.createdAt DESC")
    List<ArticleCommentEntity> findByUserId(@Param("userId") Integer userId);

    /**
     * 특정 기사 댓글 수
     */
    @Query("SELECT COUNT(c) FROM ArticleCommentEntity c WHERE c.article.id = :articleId")
    long countByArticleId(@Param("articleId") Integer articleId);

    // 기사 기준 전체 댓글/대댓글 조회 (작성 시간 순)
    List<ArticleCommentEntity> findByArticle_IdOrderByCreatedAtAsc(Integer articleId);

    @Query("SELECT COUNT(c) FROM ArticleCommentEntity c WHERE c.article.id = :articleId")
long countCommentsByArticle(@Param("articleId") Integer articleId);

@Query("SELECT COALESCE(SUM(c.likeCount), 0) FROM ArticleCommentEntity c WHERE c.article.id = :articleId")
long sumCommentLikesByArticle(@Param("articleId") Integer articleId);

}
