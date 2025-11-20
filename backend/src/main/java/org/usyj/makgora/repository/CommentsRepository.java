package org.usyj.makgora.repository;

import org.usyj.makgora.entity.CommentsEntity;
import org.usyj.makgora.entity.IssueEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

// 이슈 상세 페이지 댓글
public interface CommentsRepository extends JpaRepository<CommentsEntity, Long> {

    // 특정 이슈의 "루트 댓글" 목록 조회 (대댓글 제외)
    List<CommentsEntity> findByIssueAndParentIsNullOrderByCreatedAtAsc(IssueEntity issue);
}
