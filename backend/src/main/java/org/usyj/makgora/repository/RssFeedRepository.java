package org.usyj.makgora.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.usyj.makgora.entity.RssFeedEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface RssFeedRepository extends JpaRepository<RssFeedEntity, Integer> {

    // URL로 피드 조회
    Optional<RssFeedEntity> findByUrl(String url);

    // 활성 상태인 피드 목록 조회
    List<RssFeedEntity> findByStatus(RssFeedEntity.Status status);
}
