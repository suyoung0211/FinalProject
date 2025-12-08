package org.usyj.makgora.store.Data;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.usyj.makgora.entity.StoreItemEntity;
import org.usyj.makgora.repository.StoreItemRepository;

@Configuration
@RequiredArgsConstructor
public class StoreDataInitializer {

    private final StoreItemRepository storeItemRepository;

    @PostConstruct
    public void initStoreItems() {

        // 이미 데이터가 존재하면 초기화 진행 안 함
        if (storeItemRepository.count() > 0) return;

        // ============================
        // 🟩 1. 프로필 테두리 (FRAME)
        // ============================
        storeItemRepository.save(StoreItemEntity.builder()
                .name("골드 테두리")
                .type(StoreItemEntity.ItemType.POINT)
                .category(StoreItemEntity.Category.FRAME)
                .price(1000)
                .stock(999)
                .image("uploads/frame/b1879215-b101-431a-be07-71b6587e5079.png")
                .build());
        
        storeItemRepository.save(StoreItemEntity.builder()
                .name("블루 글로우 테두리")
                .type(StoreItemEntity.ItemType.POINT)
                .category(StoreItemEntity.Category.FRAME)
                .price(1200)
                .stock(999)
                .image("uploads/frame/image.png")
                .build());

        storeItemRepository.save(StoreItemEntity.builder()
                .name("사이버펑크 테두리")
                .type(StoreItemEntity.ItemType.POINT)
                .category(StoreItemEntity.Category.FRAME)
                .price(1500)
                .stock(999)
                .image("/uploads/frame/767d8afe-8068-43e7-9f72-92b1771b31b5.png")
                .build());

        storeItemRepository.save(StoreItemEntity.builder()
                .name("챌린저 테두리")
                .type(StoreItemEntity.ItemType.POINT)
                .category(StoreItemEntity.Category.FRAME)
                .price(100000)
                .stock(999)
                .image("/uploads/frame/61d6866d-fc36-400a-aa21-befa8bc454ed.png")
                .build());

        // ============================
        // 🟧 2. 닉네임 뱃지 (BADGE)
        // ============================
        storeItemRepository.save(StoreItemEntity.builder()
                .name("왕관 뱃지")
                .type(StoreItemEntity.ItemType.POINT)
                .category(StoreItemEntity.Category.BADGE)
                .price(800)
                .stock(999)
                .image("👑")
                .build());

        storeItemRepository.save(StoreItemEntity.builder()
                .name("불꽃 뱃지")
                .type(StoreItemEntity.ItemType.POINT)
                .category(StoreItemEntity.Category.BADGE)
                .price(700)
                .stock(999)
                .image("🔥")
                .build());

        storeItemRepository.save(StoreItemEntity.builder()
                .name("별 뱃지")
                .type(StoreItemEntity.ItemType.POINT)
                .category(StoreItemEntity.Category.BADGE)
                .price(500)
                .stock(999)
                .image("⭐")
                .build());

        System.out.println("📦 상점 초기 아이템(FRAME + BADGE) 등록 완료!");
    }
}
