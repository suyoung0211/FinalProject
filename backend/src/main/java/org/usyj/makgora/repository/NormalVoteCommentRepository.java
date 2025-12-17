package org.usyj.makgora.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.usyj.makgora.vote.entity.NormalVoteCommentEntity;

public interface NormalVoteCommentRepository extends JpaRepository<NormalVoteCommentEntity, Long> {

    // 전체 조회 (필요시)
    List<NormalVoteCommentEntity> findByNormalVote_Id(Long normalVoteId);

    // 부모 댓글이 없는 루트 댓글만 조회
    List<NormalVoteCommentEntity> findByNormalVote_IdAndParentIsNull(Integer normalVoteId);

    // 부모 댓글 기준 자식 조회용 (재귀 트리 만들 때 필요할 수 있음)
    List<NormalVoteCommentEntity> findByParent_Id(Long parentId);
}