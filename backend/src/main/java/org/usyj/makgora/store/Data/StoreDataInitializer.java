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
                .image("https://i.imgur.com/7Ph0XNs.png")
                .build());

        storeItemRepository.save(StoreItemEntity.builder()
                .name("블루 글로우 테두리")
                .type(StoreItemEntity.ItemType.POINT)
                .category(StoreItemEntity.Category.FRAME)
                .price(1200)
                .stock(999)
                .image("https://i.imgur.com/R8XlK3o.png")
                .build());

        storeItemRepository.save(StoreItemEntity.builder()
                .name("레드 파이어 테두리")
                .type(StoreItemEntity.ItemType.POINT)
                .category(StoreItemEntity.Category.FRAME)
                .price(1500)
                .stock(999)
                .image("https://i.imgur.com/nT6eW3k.png")
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
