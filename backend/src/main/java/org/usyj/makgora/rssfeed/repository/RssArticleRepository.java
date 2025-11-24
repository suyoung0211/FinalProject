package org.usyj.makgora.rssfeed.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.usyj.makgora.entity.RssArticleEntity;
import org.usyj.makgora.entity.RssFeedEntity;

import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface RssArticleRepository extends JpaRepository<RssArticleEntity, Integer> {

    // 특정 RSS 피드에 속한 기사 조회
    List<RssArticleEntity> findByFeed(RssFeedEntity feed);

    // 링크로 단일 기사 조회 (고유)
    Optional<RssArticleEntity> findByLink(String link);

    // 제목으로 기사 검색 (부분 검색은 JPQL이나 @Query 필요)
    List<RssArticleEntity> findByTitleContaining(String keyword);

    // 링크 중복 체크
    boolean existsByLink(String link);

    // 썸네일 저장
    @Transactional
    @Modifying
    @Query("UPDATE RssArticleEntity a SET a.thumbnailUrl = :thumbnail WHERE a.id = :id")
    void updateThumbnail(Integer id, String thumbnail);
}