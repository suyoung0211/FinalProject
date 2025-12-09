package org.usyj.makgora.store.request;

import lombok.Data;

@Data
public class StoreItemCreateRequest {
    private String name;
    private String category;
    private String type;
    private Integer price;
    private Integer stock;
    private String image; // ← imageUrl 삭제 후 image 사용
}