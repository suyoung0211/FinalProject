package org.usyj.makgora.community.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.usyj.makgora.entity.CommunityCommentEntity;

import java.util.List;

public interface CommunityCommentRepository extends JpaRepository<CommunityCommentEntity, Long> {

    // 특정 게시글의 모든 댓글/대댓글을 작성시간 기준으로 가져오기
    List<CommunityCommentEntity> findByPost_PostIdOrderByCreatedAtAsc(Long postId);
}
