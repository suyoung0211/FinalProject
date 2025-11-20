package org.usyj.makgora.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.usyj.makgora.entity.IssueEntity;
import org.usyj.makgora.entity.RssArticleEntity;
import org.usyj.makgora.entity.CommunityPostEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface IssueRepository extends JpaRepository<IssueEntity, Integer> {

    // 특정 기사와 연관된 이슈 조회
    List<IssueEntity> findByArticle(RssArticleEntity article);

    // 특정 커뮤니티 글과 연관된 이슈 조회
    List<IssueEntity> findByCommunityPost(CommunityPostEntity communityPost);

    // 상태별 이슈 조회
    List<IssueEntity> findByStatus(IssueEntity.Status status);

    // 특정 기사와 상태로 이슈 조회
    List<IssueEntity> findByArticleAndStatus(RssArticleEntity article, IssueEntity.Status status);

    // 특정 커뮤니티 글과 상태로 이슈 조회
    List<IssueEntity> findByCommunityPostAndStatus(CommunityPostEntity communityPost, IssueEntity.Status status);

    // 제목으로 단일 이슈 조회
    Optional<IssueEntity> findByTitle(String title);
}