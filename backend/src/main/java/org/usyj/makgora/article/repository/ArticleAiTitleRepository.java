package org.usyj.makgora.article.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.usyj.makgora.article.entity.ArticleAiTitleEntity;
import org.usyj.makgora.entity.RssArticleEntity;

@Repository
public interface ArticleAiTitleRepository extends JpaRepository<ArticleAiTitleEntity, Integer> {

    // 특정 기사에 대한 모든 요약 조회

    Optional<ArticleAiTitleEntity> findByArticle(RssArticleEntity article);

    // 🔥 반드시 추가해야 하는 메서드
    ArticleAiTitleEntity findByArticle_Id(Integer articleId);

    /** ✔ ArticleListService가 사용하는 메서드 */
    Optional<ArticleAiTitleEntity> findByArticleId(Integer articleId);
    
    // 특정 기사 + 모델명으로 요약 조회
    Optional<ArticleAiTitleEntity> findByArticleAndModelName(RssArticleEntity article, String modelName);

    // AI 제목 생성 갯수 조회
    long countByStatus(String status); // 성공한 제목 개수 조회
}