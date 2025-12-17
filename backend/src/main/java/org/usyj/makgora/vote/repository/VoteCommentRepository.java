package org.usyj.makgora.vote.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.usyj.makgora.vote.entity.VoteCommentEntity;

/**
 * 💬 VoteCommentRepository
 * AI 투표 댓글 + 대댓글 트리 조회
 */
public interface VoteCommentRepository extends JpaRepository<VoteCommentEntity, Long> {

    List<VoteCommentEntity> findByVote_IdAndParentIsNull(Integer voteId);
}
