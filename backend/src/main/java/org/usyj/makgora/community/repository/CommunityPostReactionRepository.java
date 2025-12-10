package org.usyj.makgora.community.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.usyj.makgora.entity.CommunityPostEntity;
import org.usyj.makgora.entity.CommunityPostReactionEntity;
import org.usyj.makgora.entity.UserEntity;

import java.util.Optional;

/**
 * 커뮤니티 게시글 반응(추천/비추천) 레포지토리
 * - 한 유저가 특정 게시글에 남긴 반응 조회
 * - 게시글 전체 반응 목록 조회 등
 */
public interface CommunityPostReactionRepository extends JpaRepository<CommunityPostReactionEntity, Long> {

    Optional<CommunityPostReactionEntity> findByPostAndUser(CommunityPostEntity post, UserEntity user);
    /**
     * 특정 게시글에 대해 특정 유저가 남긴 반응 1개 조회
     * - 존재하면 Optional에 담겨서 반환
     * - 없으면 Optional.empty()
     */

    /**
     * 특정 게시글의 모든 반응 삭제
     */
    void deleteByPost(CommunityPostEntity post);
}
