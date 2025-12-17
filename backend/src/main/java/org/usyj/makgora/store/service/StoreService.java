package org.usyj.makgora.store.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.usyj.makgora.store.dto.request.StoreItemPurchaseRequest;
import org.usyj.makgora.store.dto.response.StoreItemResponse;
import org.usyj.makgora.store.dto.response.UserStoreResponse;
import org.usyj.makgora.store.entity.StoreItemEntity;
import org.usyj.makgora.store.entity.UserStoreEntity;
import org.usyj.makgora.store.repository.StoreItemRepository;
import org.usyj.makgora.store.repository.UserStoreRepository;
import org.usyj.makgora.user.entity.UserEntity;
import org.usyj.makgora.user.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class StoreService {

    private final StoreItemRepository storeItemRepository;
    private final UserStoreRepository userStoreRepository;
    private final UserRepository userRepository;

    /** 아이템 목록 조회 */
    public List<StoreItemResponse> getItems(String category, String type) {

        List<StoreItemEntity> items;

        if (category != null && type != null) {
            items = storeItemRepository.findByCategoryAndType(
                    StoreItemEntity.Category.valueOf(category.toUpperCase()),
                    StoreItemEntity.ItemType.valueOf(type.toUpperCase())
            );
        } else if (category != null) {
            items = storeItemRepository.findByCategory(
                    StoreItemEntity.Category.valueOf(category.toUpperCase())
            );
        } else if (type != null) {
            items = storeItemRepository.findByType(
                    StoreItemEntity.ItemType.valueOf(type.toUpperCase())
            );
        } else {
            items = storeItemRepository.findAll();
        }

        return items.stream()
                .map(StoreItemResponse::fromEntity)
                .toList();
    }

    /** 아이템 상세 */
    public StoreItemResponse getItem(Integer id) {
        StoreItemEntity item = storeItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("아이템 없음"));
        return StoreItemResponse.fromEntity(item);
    }

    /** 아이템 구매 */
    public UserStoreResponse purchaseItem(Integer userId, StoreItemPurchaseRequest req) {

        // 유저
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("유저 없음"));

        // 아이템
        StoreItemEntity item = storeItemRepository.findById(req.getItemId())
                .orElseThrow(() -> new RuntimeException("아이템 없음"));

        // 포인트 체크
        if (user.getPoints() < item.getPrice()) {
            throw new RuntimeException("포인트 부족");
        }

        // 포인트 차감
        user.setPoints(user.getPoints() - item.getPrice());

        // ⭐ DB 반영
        userRepository.save(user);

        // 구매 엔티티 생성
        UserStoreEntity record = UserStoreEntity.builder()
                .user(user)
                .item(item)
                .refundable(true)
                .build();

        userStoreRepository.save(record);

        return UserStoreResponse.fromEntity(record);
    }

    /** 내 아이템 목록 */
    public List<UserStoreResponse> getMyItems(Integer userId) {

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("유저 없음"));

        List<UserStoreEntity> list = userStoreRepository.findByUser(user);

        return list.stream()
                .map(UserStoreResponse::fromEntity)
                .toList();
    }
}
