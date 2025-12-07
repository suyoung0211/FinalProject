package org.usyj.makgora.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.usyj.makgora.entity.VoteCommentEntity;

/**
 * 💬 VoteCommentRepository
 * AI 투표 댓글 + 대댓글 트리 조회
 */
public interface VoteCommentRepository extends JpaRepository<VoteCommentEntity, Long> {

    List<VoteCommentEntity> findByVoteIdAndParentIsNull(Integer voteId);

    // NormalVote 댓글 (추가!)
    List<VoteCommentEntity> findByNormalVote_IdAndParentIsNull(Long normalVoteId);

    List<VoteCommentEntity> findByParentCommentId(Long parentId);

    int countByNormalVote_Id(Long normalVoteId);

    List<VoteCommentEntity> findByVote_IdAndParentIsNull(Integer voteId);
}
