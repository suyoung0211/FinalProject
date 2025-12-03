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
import java.util.Set;

@Repository
public interface RssArticleRepository extends JpaRepository<RssArticleEntity, Integer> {

    List<RssArticleEntity> findByFeed(RssFeedEntity feed);

    boolean existsByLink(String link);

    Optional<RssArticleEntity> findByLink(String link);

    @Transactional
    @Modifying
    @Query("UPDATE RssArticleEntity a SET a.thumbnailUrl = :thumbnail WHERE a.id = :id")
    void updateThumbnail(Integer id, String thumbnail);

    List<RssArticleEntity> findByFeedAndLinkIn(RssFeedEntity feed, Set<String> links);
}
