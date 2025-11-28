package org.usyj.makgora.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.usyj.makgora.entity.StoreItemEntity;
import org.usyj.makgora.entity.UserEntity;
import org.usyj.makgora.entity.UserStoreEntity;

public interface UserStoreRepository extends JpaRepository<UserStoreEntity, Long> {

    List<UserStoreEntity> findByUser(UserEntity user);

    List<UserStoreEntity> findByItem(StoreItemEntity item);
}