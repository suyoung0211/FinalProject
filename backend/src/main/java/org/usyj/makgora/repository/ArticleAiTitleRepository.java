package org.usyj.makgora.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.usyj.makgora.entity.ArticleAiTitleEntity;
import org.usyj.makgora.entity.RssArticleEntity;

@Repository
public interface ArticleAiTitleRepository extends JpaRepository<ArticleAiTitleEntity, Integer> {
    Optional<ArticleAiTitleEntity> findByArticle(RssArticleEntity article);
}
