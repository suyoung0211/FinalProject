package org.usyj.makgora.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
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

    Optional<IssueEntity> findByCommunityPost_PostId(Long postId);

    Optional<IssueEntity> findByArticleId(Integer articleId);
}