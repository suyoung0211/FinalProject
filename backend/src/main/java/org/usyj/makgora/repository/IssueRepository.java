package org.usyj.makgora.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.NativeQuery;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.usyj.makgora.entity.IssueEntity;

import java.util.List;
import java.util.Optional;

public interface IssueRepository extends JpaRepository<IssueEntity, Integer> {

    // AI가 만든 승인된 이슈 TOP N (예: 20개)
    List<IssueEntity> findTop20ByCreatedByAndStatusOrderByCreatedAtDesc(
            IssueEntity.CreatedBy createdBy,
            IssueEntity.Status status
    );

    // 페이지네이션 지원 (무한스크롤)
    Page<IssueEntity> findByStatusOrderByCreatedAtDesc(
            IssueEntity.Status status,
            Pageable pageable
    );

    @NativeQuery("SELECT * FROM issues i WHERE i.community_post_id = :postId")
    Optional<IssueEntity> findByCommunityPostId(@Param("postId") Long postId);

    Optional<IssueEntity> findByArticleId(Integer articleId);

    @Query("SELECT i FROM IssueEntity i " + 
       "LEFT JOIN FETCH i.article a " +         // IssueEntity와 연관된 RssArticleEntity를 한 번에 조회
       "LEFT JOIN FETCH i.communityPost c " +   // IssueEntity와 연관된 CommunityPostEntity도 한 번에 조회
       "ORDER BY i.createdAt DESC")             // 생성일(createdAt)을 기준으로 내림차순 정렬
    List<IssueEntity> findAllWithRelations();
}