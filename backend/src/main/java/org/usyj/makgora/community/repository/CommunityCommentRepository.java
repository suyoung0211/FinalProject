package org.usyj.makgora.community.repository;

import org.usyj.makgora.entity.CommunityCommentEntity;
import org.usyj.makgora.entity.CommunityPostEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * 커뮤니티 게시글 댓글 Repository
 *
 * 기능 포함:
 * - 특정 게시글의 "루트 댓글"(parent = null) 조회
 * - 특정 게시글의 전체 댓글 목록 조회
 * - 특정 게시글의 댓글 likeCount 합계 계산 (AI 점수 계산용)
 * - 특정 게시글 전체 댓글 수 조회
 * - 특정 유저가 작성한 댓글 조회
 */
public interface CommunityCommentRepository extends JpaRepository<CommunityCommentEntity, Long> {

    /**
     * 특정 게시글(post)에서 부모 댓글(parent가 null)만 가져오기
     * → 즉 "루트 댓글"만 조회 (대댓글 제외)
     * → 기존 팀원이 만들었던 기능 그대로 유지
     */
    List<CommunityCommentEntity> findByPostAndParentIsNullOrderByCreatedAtAsc(CommunityPostEntity post);

    /**
     * 특정 게시글(postId)의 전체 댓글 목록(부모+대댓글) 최신순 조회
     * → 댓글 전체를 가져와야 할 때 사용
     */
    @Query("SELECT c FROM CommunityCommentEntity c WHERE c.post.postId = :postId ORDER BY c.createdAt DESC")
    List<CommunityCommentEntity> findAllByPostId(@Param("postId") Long postId);

    /**
     * 특정 게시글의 모든 댓글들의 likeCount 합계
     * → AI 점수 계산 공식에서 사용됨
     */
    @Query("SELECT COALESCE(SUM(c.likeCount), 0) FROM CommunityCommentEntity c WHERE c.post.postId = :postId")
    long sumLikeCountByPost(@Param("postId") Long postId);

    /**
     * 특정 게시글의 전체 댓글 수
     * (루트 댓글 + 대댓글 포함)
     */
    @Query("SELECT COUNT(c) FROM CommunityCommentEntity c WHERE c.post.postId = :postId")
    long countByPostId(@Param("postId") Long postId);

    /**
     * 특정 유저가 작성한 댓글들 조회 (최신순)
     */
    @Query("SELECT c FROM CommunityCommentEntity c WHERE c.user.id = :userId ORDER BY c.createdAt DESC")
    List<CommunityCommentEntity> findByUserId(@Param("userId") Integer userId);
}