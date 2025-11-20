package org.usyj.makgora.repository;

import org.usyj.makgora.entity.CommunityPostsEntity;
import org.usyj.makgora.entity.UsersEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

// 커뮤니티 게시글
public interface CommunityPostsRepository extends JpaRepository<CommunityPostsEntity, Long> {

    // 특정 사용자가 작성한 게시글 목록 조회
    List<CommunityPostsEntity> findByUserOrderByCreatedAtDesc(UsersEntity user);
}
