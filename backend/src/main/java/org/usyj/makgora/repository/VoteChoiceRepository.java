package org.usyj.makgora.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.usyj.makgora.vote.entity.VoteOptionChoiceEntity;

/**
 * 🟩 VoteChoiceRepository
 * 옵션(option) 안에 있는 선택지(choice) 목록을 조회.
 */
public interface VoteChoiceRepository extends JpaRepository<VoteOptionChoiceEntity, Integer> {

    List<VoteOptionChoiceEntity> findByOptionId(Integer optionId);
}
