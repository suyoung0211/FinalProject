package org.usyj.makgora.response;

import org.usyj.makgora.store.entity.StoreItemEntity;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StoreItemResponse {
    private Integer itemId;
    private String name;
    private String type;      // POINT / CASH
    private String category;  // FRAME / BADGE
    private Integer price;
    private Integer stock;
    private String image;
    private String createdAt;

    public static StoreItemResponse fromEntity(StoreItemEntity e) {
        return StoreItemResponse.builder()
                .itemId(e.getId())
                .name(e.getName())
                .type(e.getType().name())
                .category(e.getCategory().name())
                .price(e.getPrice())
                .stock(e.getStock())
                .image(e.getImage())
                .createdAt(e.getCreatedAt() != null ? e.getCreatedAt().toString() : null)
                .build();
    }
}
