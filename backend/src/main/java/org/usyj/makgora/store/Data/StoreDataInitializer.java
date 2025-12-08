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

    upsert("브론즈 테두리", StoreItemEntity.Category.FRAME, 500,
            "uploads/frame/edc670df-7304-43e5-bfbe-963bedbaefd7.png");         
            
    upsert("골드 테두리", StoreItemEntity.Category.FRAME, 10000,
            "uploads/frame/b1879215-b101-431a-be07-71b6587e5079.png");

    upsert("블루 글로우 테두리", StoreItemEntity.Category.FRAME, 12000,
            "uploads/frame/image.png");

    upsert("사이버펑크 테두리", StoreItemEntity.Category.FRAME, 150000,
            "uploads/frame/767d8afe-8068-43e7-9f72-92b1771b31b5.png");

    upsert("챌린저 테두리", StoreItemEntity.Category.FRAME, 5000000,
            "uploads/frame/61d6866d-fc36-400a-aa21-befa8bc454ed.png");
            
    upsert("악마의 앞잡이 테두리", StoreItemEntity.Category.FRAME, 50000,
            "uploads/frame/2cc60e02-e122-4296-b175-92f4d9001949.png"); 

    upsert("미래를 예측한 자 테두리", StoreItemEntity.Category.FRAME, 1290000,
            "uploads/frame/c325b640-f4dc-4fa1-b5b3-9b9a60d97035.png");
            
    upsert("실버 테두리", StoreItemEntity.Category.FRAME, 5000,
            "uploads/frame/81d273f4-2631-4d23-a6c9-2897004b7154.png");   

    upsert("마스터 테두리", StoreItemEntity.Category.FRAME, 50000,
            "uploads/frame/0df935f2-c8a3-42bd-b3de-3497185d44b1.png");     

    upsert("고인물 테두리", StoreItemEntity.Category.FRAME, 100000,
            "uploads/frame/f79cd953-58dc-43b3-8b82-6c2b6bad7e82.png");

    upsert("예견자 테두리", StoreItemEntity.Category.FRAME, 444444,
            "uploads/frame/6cb1b051-8ec0-4b37-894b-5691295770e5.png");

    upsert("정복자 테두리", StoreItemEntity.Category.FRAME, 120000,
            "uploads/frame/e19b7d8e-9778-436f-b850-5237490ab9f7.png");

    upsert("사이어인 테두리", StoreItemEntity.Category.FRAME, 40000,
            "uploads/frame/ec2985a0-e8c9-4be5-8fa9-5274bb3a1f92.png");
    


    
    // Badge
    upsert("왕관 뱃지", StoreItemEntity.Category.BADGE, 800, "👑");
    upsert("불꽃 뱃지", StoreItemEntity.Category.BADGE, 700, "🔥");
    upsert("별 뱃지", StoreItemEntity.Category.BADGE, 500, "⭐");
    upsert("손 하트 뱃지", StoreItemEntity.Category.BADGE, 1000, "🤞");
    upsert("튤립 뱃지", StoreItemEntity.Category.BADGE, 600, "🌹");
    upsert("펑펑 뱃지", StoreItemEntity.Category.BADGE, 700, "💥");

    System.out.println("📦 상점 자동 동기화 완료!");
}

private void upsert(String name, StoreItemEntity.Category category, int price, String image) {
    StoreItemEntity item = storeItemRepository.findByName(name)
            .orElse(StoreItemEntity.builder()
                    .name(name)
                    .category(category)
                    .type(StoreItemEntity.ItemType.POINT)
                    .stock(999) // 기본
                    .build());

    // 변경 사항 자동 반영
    item.setPrice(price);
    item.setImage(image);

    storeItemRepository.save(item);
}
}
