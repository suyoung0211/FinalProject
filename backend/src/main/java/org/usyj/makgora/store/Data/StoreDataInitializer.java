package org.usyj.makgora.store.Data;


import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.usyj.makgora.entity.StoreItemEntity;
import org.usyj.makgora.entity.StoreItemEntity.ItemType;
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
        storeItemRepository.save(StoreItemEntity.builder()
                .name("달빛 아이콘")
                .type(ItemType.POINT)
                .category(StoreItemEntity.Category.AVATAR)
                .price(600)
                .stock(999)
                .image("https://cdn-icons-png.flaticon.com/512/869/869869.png")
                .build());

        storeItemRepository.save(StoreItemEntity.builder()
                .name("해골 아이콘")
                .type(ItemType.POINT)
                .category(StoreItemEntity.Category.AVATAR)
                .price(800)
                .stock(999)
                .image("https://cdn-icons-png.flaticon.com/512/552/552721.png")
                .build());

        storeItemRepository.save(StoreItemEntity.builder()
                .name("무지개 아이콘")
                .type(ItemType.POINT)
                .category(StoreItemEntity.Category.AVATAR)
                .price(900)
                .stock(999)
                .image("https://cdn-icons-png.flaticon.com/512/326/326905.png")
                .build());

        storeItemRepository.save(StoreItemEntity.builder()
                .name("얼음 결정 아이콘")
                .type(ItemType.POINT)
                .category(StoreItemEntity.Category.AVATAR)
                .price(700)
                .stock(999)
                .image("https://cdn-icons-png.flaticon.com/512/481/481176.png")
                .build());

        storeItemRepository.save(StoreItemEntity.builder()
                .name("번개 아이콘")
                .type(ItemType.POINT)
                .category(StoreItemEntity.Category.AVATAR)
                .price(850)
                .stock(999)
                .image("https://cdn-icons-png.flaticon.com/512/1146/1146869.png")
                .build());

        storeItemRepository.save(StoreItemEntity.builder()
                .name("클로버 아이콘")
                .type(ItemType.POINT)
                .category(StoreItemEntity.Category.AVATAR)
                .price(650)
                .stock(999)
                .image("https://cdn-icons-png.flaticon.com/512/765/765514.png")
                .build());

        storeItemRepository.save(StoreItemEntity.builder()
                .name("폭죽 아이콘")
                .type(ItemType.POINT)
                .category(StoreItemEntity.Category.AVATAR)
                .price(700)
                .stock(999)
                .image("https://cdn-icons-png.flaticon.com/512/763/763812.png")
                .build());

        storeItemRepository.save(StoreItemEntity.builder()
                .name("악마 아이콘")
                .type(ItemType.POINT)
                .category(StoreItemEntity.Category.AVATAR)
                .price(900)
                .stock(999)
                .image("https://cdn-icons-png.flaticon.com/512/2821/2821082.png")
                .build());

        storeItemRepository.save(StoreItemEntity.builder()
                .name("천사 아이콘")
                .type(ItemType.POINT)
                .category(StoreItemEntity.Category.AVATAR)
                .price(1200)
                .stock(999)
                .image("https://cdn-icons-png.flaticon.com/512/236/236831.png")
                .build());

        storeItemRepository.save(StoreItemEntity.builder()
                .name("블루 파이어 아이콘")
                .type(ItemType.POINT)
                .category(StoreItemEntity.Category.AVATAR)
                .price(900)
                .stock(999)
                .image("https://cdn-icons-png.flaticon.com/512/482/482524.png")
                .build());

        storeItemRepository.save(StoreItemEntity.builder()
                .name("골든 스타 아이콘")
                .type(ItemType.POINT)
                .category(StoreItemEntity.Category.AVATAR)
                .price(1300)
                .stock(999)
                .image("https://cdn-icons-png.flaticon.com/512/2583/2583381.png")
                .build());

        storeItemRepository.save(StoreItemEntity.builder()
                .name("행운 동전 아이콘")
                .type(ItemType.POINT)
                .category(StoreItemEntity.Category.AVATAR)
                .price(750)
                .stock(999)
                .image("https://cdn-icons-png.flaticon.com/512/217/217853.png")
                .build());

        System.out.println("📦 기본 상점 아이템 초기화 완료!");
    }
}