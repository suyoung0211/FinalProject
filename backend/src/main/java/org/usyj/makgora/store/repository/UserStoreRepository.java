package org.usyj.makgora.store.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.usyj.makgora.store.entity.StoreItemEntity;
import org.usyj.makgora.store.entity.UserStoreEntity;
import org.usyj.makgora.user.entity.UserEntity;

public interface UserStoreRepository extends JpaRepository<UserStoreEntity, Long> {

    // 유저가 가진 모든 아이템
    List<UserStoreEntity> findByUser(UserEntity user);

    // 특정 아이템 가진 유저 (관리자용)
    List<UserStoreEntity> findByItem(StoreItemEntity item);

    // userId로 직접 조회 (가장 많이 사용)
    List<UserStoreEntity> findByUserId(Integer userId);

    // 유저가 가진 특정 카테고리 아이템
    List<UserStoreEntity> findByUserIdAndItem_Category(Integer userId, StoreItemEntity.Category category);

    // 구매 여부 확인
    boolean existsByUserIdAndItemId(Integer userId, Integer itemId);
}