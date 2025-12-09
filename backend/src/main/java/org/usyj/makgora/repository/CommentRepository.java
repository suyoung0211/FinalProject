package org.usyj.makgora.repository;

import org.usyj.makgora.entity.VoteCommentEntity;
import org.usyj.makgora.entity.IssueEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

// 이슈 상세 페이지 댓글
public interface CommentRepository extends JpaRepository<VoteCommentEntity, Long> {

    // 특정 이슈의 "루트 댓글" 목록 조회 (대댓글 제외)
    List<VoteCommentEntity> findByIssueAndParentIsNullOrderByCreatedAtAsc(IssueEntity issue);

    // 특정 유저가 작성한 댓글 목록 조회 (최신순)
    List<VoteCommentEntity> findByUser_IdOrderByCreatedAtDesc(Integer userId);

    
}
