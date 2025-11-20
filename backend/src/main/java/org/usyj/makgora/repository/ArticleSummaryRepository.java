package org.usyj.makgora.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.usyj.makgora.entity.ArticleSummaryEntity;
import org.usyj.makgora.entity.RssArticleEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArticleSummaryRepository extends JpaRepository<ArticleSummaryEntity, Integer> {

    // 특정 기사에 대한 모든 요약 조회
    List<ArticleSummaryEntity> findByArticle(RssArticleEntity article);

    // 특정 기사 + 모델명으로 요약 조회
    Optional<ArticleSummaryEntity> findByArticleAndModelName(RssArticleEntity article, String modelName);
}