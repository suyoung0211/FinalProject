package org.usyj.makgora.rssfeed.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.usyj.makgora.entity.RssArticleEntity;
import org.usyj.makgora.entity.RssFeedEntity;

import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;

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

//     * 📌 Paginated Category Search
//  * 특정 카테고리 이름(category)에 속한 기사들을
//  * 페이지네이션(Pageable) 기반으로 조회한다.
    @Query("""
    SELECT DISTINCT a
    FROM RssArticleEntity a
    JOIN a.categories c
    WHERE c.name = :category
""")
Page<RssArticleEntity> findByCategoryName(@Param("category") String category, Pageable pageable);


    // 썸네일 저장
    @Transactional
    @Modifying
    @Query("UPDATE RssArticleEntity a SET a.thumbnailUrl = :thumbnail WHERE a.id = :id")
    void updateThumbnail(Integer id, String thumbnail);

    // 특정 feed에서 링크가 존재하는 것만 조회
    List<RssArticleEntity> findByFeedAndLinkIn(RssFeedEntity feed, Set<String> links);

    /**
 * 📌 Category-based Article List Search (No Pagination)
 * 특정 카테고리 이름(category)에 해당하는 기사들을
 * 전체 리스트 형태(List<RssArticleEntity>)로 조회한다.
 *
 * 사용 예:
 * List<RssArticleEntity> list = repo.findAllByCategoryName("경제");
 *
 * Home 화면 또는 특정 카테고리 전체를 보여줄 때 사용됨.
 */
     // 카테고리로 기사 조회
    @Query("SELECT a FROM RssArticleEntity a JOIN a.categories c WHERE c.name = :category")
List<RssArticleEntity> findAllByCategoryName(String category);
}