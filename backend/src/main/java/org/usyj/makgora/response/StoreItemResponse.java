package org.usyj.makgora.response;

import org.usyj.makgora.entity.StoreItemEntity;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StoreItemResponse {
    private Integer itemId;
    private String name;
    private String type;
    private String category;
    private Integer price;
    private Integer stock;
    private String image;
    private String createdAt;

    public static StoreItemResponse fromEntity(StoreItemEntity e) {
    return StoreItemResponse.builder()
            .itemId(e.getId())
            .name(e.getName())
            .type(e.getType().name())          // enum to String
            .category(e.getCategory().name())  // enum to String
            .price(e.getPrice())
            .stock(e.getStock())
            .image(e.getImage() != null ? e.getImage() : "🌹")  // 기본 이미지
            .createdAt(e.getCreatedAt() != null ? e.getCreatedAt().toString() : null)
            .build();
}
}

