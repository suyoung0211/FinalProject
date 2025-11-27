// src/main/java/org/usyj/makgora/repository/IssueRepository.java
package org.usyj.makgora.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.usyj.makgora.entity.IssueEntity;

import java.util.List;

public interface IssueRepository extends JpaRepository<IssueEntity, Integer> {

    // AI가 만든 승인된 이슈 TOP N (예: 30개)
    List<IssueEntity> findTop30ByCreatedByAndStatusOrderByCreatedAtDesc(
            IssueEntity.CreatedBy createdBy,
            IssueEntity.Status status
    );
}
