package org.usyj.makgora.article.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.usyj.makgora.article.entity.RssArticleEntity;

import java.util.List;

@Repository
public interface ArticleRepository extends JpaRepository<RssArticleEntity, Integer> {

    /** 최신 기사 20개 */
    List<RssArticleEntity> findTop20ByOrderByPublishedAtDesc();

    /** 특정 카테고리 전체 기사 */
    @Query("""
        SELECT a
        FROM RssArticleEntity a
        JOIN a.categories c
        WHERE c.name = :category
        ORDER BY a.publishedAt DESC
    """)
    List<RssArticleEntity> findAllByCategoryName(@Param("category") String category);

    /** 페이징 */
    @Query("""
        SELECT DISTINCT a
        FROM RssArticleEntity a
        JOIN a.categories c
        WHERE c.name = :category
    """)
    Page<RssArticleEntity> findByCategoryPaged(
            @Param("category") String category,
            Pageable pageable
    );
}
