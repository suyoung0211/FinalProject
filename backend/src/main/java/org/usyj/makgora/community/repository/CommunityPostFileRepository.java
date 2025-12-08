package org.usyj.makgora.community.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.usyj.makgora.entity.CommunityPostFileEntity;
import java.util.List;

public interface CommunityPostFileRepository extends JpaRepository<CommunityPostFileEntity, Long> {
    
    /** 특정 게시글의 모든 첨부파일 조회 (생성일 오름차순) */
    List<CommunityPostFileEntity> findByPost_PostIdOrderByCreatedAtAsc(Long postId);
    
    /** 특정 게시글의 파일 개수 */
    long countByPost_PostId(Long postId);
    
    /** 파일 ID로 삭제 */
    void deleteByFileId(Long fileId);
    
    /** 특정 게시글의 모든 파일 삭제 */
    void deleteByPost_PostId(Long postId);
}