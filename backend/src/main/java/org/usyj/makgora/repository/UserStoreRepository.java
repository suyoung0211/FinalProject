package org.usyj.makgora.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.usyj.makgora.entity.UserStoreEntity;

public interface UserStoreRepository extends JpaRepository<UserStoreEntity, Long> {

    List<UserStoreEntity> findByUserUserId(Long userId);

    List<UserStoreEntity> findByItemItemId(Long itemId);
}