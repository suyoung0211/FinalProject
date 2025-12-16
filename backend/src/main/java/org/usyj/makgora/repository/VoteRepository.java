package org.usyj.makgora.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.usyj.makgora.entity.VoteEntity;
import org.usyj.makgora.entity.IssueEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoteRepository extends JpaRepository<VoteEntity, Integer> {
    long count();

    // 특정 이슈와 연관된 투표 조회
    List<VoteEntity> findByIssue(IssueEntity issue);

    Optional<VoteEntity> findByIssue_Id(Integer issueId);

    // 상태별 투표 조회
    List<VoteEntity> findByStatus(VoteEntity.Status status);

    List<VoteEntity> findByStatusAndEndAtBefore(VoteEntity.Status status, LocalDateTime endAtBefore);

    // 특정 이슈 + 상태로 투표 조회
    List<VoteEntity> findByIssueAndStatus(IssueEntity issue, VoteEntity.Status status);

    // 제목으로 단일 투표 조회
    Optional<VoteEntity> findByTitle(String title);

    @Query("SELECT v FROM VoteEntity v WHERE v.endAt > CURRENT_TIMESTAMP ORDER BY v.totalPoints DESC")
    List<VoteEntity> findTop3ByOrderByTotalPointsDesc();

    @Query("""
    SELECT DISTINCT v FROM VoteEntity v
    LEFT JOIN FETCH v.options o
    LEFT JOIN FETCH o.choices c
""")
List<VoteEntity> findAllWithOptionsAndChoices();

}
