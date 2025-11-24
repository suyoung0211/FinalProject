package org.usyj.makgora.rssfeed.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.usyj.makgora.entity.RssFeedEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface RssFeedRepository extends JpaRepository<RssFeedEntity, Integer> {

    // URL로 피드 조회
    Optional<RssFeedEntity> findByUrl(String url);

    // 활성 상태인 피드 목록 조회
    List<RssFeedEntity> findByStatus(RssFeedEntity.Status status);

    // 활성 상태 피드만 조회 (편의 메서드)
    default List<RssFeedEntity> findAllActiveFeeds() {
        return findByStatus(RssFeedEntity.Status.ACTIVE);
    }

    // feed와 연결된 categories까지 한 번에 가져오기
    @Query("SELECT f FROM RssFeedEntity f JOIN FETCH f.categories WHERE f.id = :id")
    RssFeedEntity findByIdWithCategories(@Param("id") Integer id);
}