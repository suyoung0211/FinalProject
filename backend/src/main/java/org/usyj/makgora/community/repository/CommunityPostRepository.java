package org.usyj.makgora.community.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.usyj.makgora.community.entity.CommunityPostEntity;
import org.usyj.makgora.user.entity.UserEntity;

import java.util.List;

// 커뮤니티 게시글
public interface CommunityPostRepository extends JpaRepository<CommunityPostEntity, Long> {
    long count();

    // 특정 사용자가 작성한 게시글 목록 조회
    List<CommunityPostEntity> findByUserOrderByCreatedAtDesc(UserEntity user);

    // ⭐ 전체 게시글 최신순 조회 (댓글도 함께 가져오기)
    @EntityGraph(attributePaths = {"comments", "user"})
    List<CommunityPostEntity> findAllByOrderByCreatedAtDesc();
}
