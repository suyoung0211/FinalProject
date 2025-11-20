package org.usyj.makgora.repository;

import org.usyj.makgora.entity.CommunityCommentsEntity;
import org.usyj.makgora.entity.CommunityPostsEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

// 커뮤니티 댓글
public interface CommunityCommentsRepository extends JpaRepository<CommunityCommentsEntity, Long> {

    // 특정 게시글의 "루트 댓글" 목록 조회 (대댓글 제외)
    List<CommunityCommentsEntity> findByPostAndParentIsNullOrderByCreatedAtAsc(CommunityPostsEntity post);
}
