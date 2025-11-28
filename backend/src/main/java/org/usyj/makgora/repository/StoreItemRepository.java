package org.usyj.makgora.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.usyj.makgora.entity.StoreItemEntity;

import java.util.List;

public interface StoreItemRepository extends JpaRepository<StoreItemEntity, Integer> {

    List<StoreItemEntity> findByCategory(StoreItemEntity.Category category);

    List<StoreItemEntity> findByType(StoreItemEntity.ItemType type);

    List<StoreItemEntity> findByCategoryAndType(
            StoreItemEntity.Category category,
            StoreItemEntity.ItemType type
    );
}