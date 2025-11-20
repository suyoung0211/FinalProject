package org.usyj.makgora.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.usyj.makgora.entity.StoreItemEntity;

public interface StoreItemRepository extends JpaRepository<StoreItemEntity, Long> {
}