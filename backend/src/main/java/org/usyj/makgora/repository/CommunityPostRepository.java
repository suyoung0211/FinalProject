package org.usyj.makgora.repository;

import org.usyj.makgora.entity.CommunityPostEntity;
import org.usyj.makgora.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

// 커뮤니티 게시글
public interface CommunityPostRepository extends JpaRepository<CommunityPostEntity, Long> {

    // 특정 사용자가 작성한 게시글 목록 조회
    List<CommunityPostEntity> findByUserOrderByCreatedAtDesc(UserEntity user);

    // ⭐ 전체 게시글 최신순 조회
    List<CommunityPostEntity> findAllByOrderByCreatedAtDesc();
}
