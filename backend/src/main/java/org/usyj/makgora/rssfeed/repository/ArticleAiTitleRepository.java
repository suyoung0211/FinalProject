package org.usyj.makgora.rssfeed.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.usyj.makgora.entity.ArticleAiTitleEntity;
import org.usyj.makgora.entity.RssArticleEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArticleAiTitleRepository extends JpaRepository<ArticleAiTitleEntity, Integer> {

    // 특정 기사에 대한 모든 요약 조회
    List<ArticleAiTitleEntity> findByArticle(RssArticleEntity article);

    // 특정 기사 + 모델명으로 요약 조회
    Optional<ArticleAiTitleEntity> findByArticleAndModelName(RssArticleEntity article, String modelName);

    // AI 제목 생성 갯수 조회
    long countByStatus(String status); // 성공한 제목 개수 조회
}