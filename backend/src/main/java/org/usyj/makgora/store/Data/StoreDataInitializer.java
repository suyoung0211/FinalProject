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

        // 이미 데이터가 있으면 아무것도 안함
        if (storeItemRepository.count() > 0) {
            return;
        }

        storeItemRepository.save(StoreItemEntity.builder()
                .name("하트 아이콘")
                .type(StoreItemEntity.ItemType.POINT)
                .category(StoreItemEntity.Category.AVATAR)
                .price(500)
                .stock(999)
                .image("❤️")
                .build());

        storeItemRepository.save(StoreItemEntity.builder()
                .name("불꽃 아이콘")
                .type(StoreItemEntity.ItemType.POINT)
                .category(StoreItemEntity.Category.AVATAR)
                .price(900)
                .stock(999)
                .image("🔥")
                .build());

        storeItemRepository.save(StoreItemEntity.builder()
                .name("왕관 배지")
                .type(StoreItemEntity.ItemType.POINT)
                .category(StoreItemEntity.Category.BADGE)
                .price(1500)
                .stock(999)
                .image("👑")
                .build());

        storeItemRepository.save(StoreItemEntity.builder()
                .name("별빛 아이콘")
                .type(StoreItemEntity.ItemType.POINT)
                .category(StoreItemEntity.Category.AVATAR)
                .price(700)
                .stock(999)
                .image("✨")
                .build());

        storeItemRepository.save(StoreItemEntity.builder()
                .name("불사조 배너")
                .type(StoreItemEntity.ItemType.POINT)
                .category(StoreItemEntity.Category.BACKGROUND)
                .price(2000)
                .stock(999)
                .image("🦅")
                .build());

        System.out.println("📦 기본 상점 아이템 초기화 완료!");
    }
}