package org.usyj.makgora.rssfeed.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.usyj.makgora.entity.ArticleCategoryEntity;

import java.util.Optional;

@Repository
public interface ArticleCategoryRepository extends JpaRepository<ArticleCategoryEntity, Integer> {

    // 카테고리 이름으로 조회
    Optional<ArticleCategoryEntity> findByName(String name);

    // 이름이 존재하는지 확인
    boolean existsByName(String name);
}