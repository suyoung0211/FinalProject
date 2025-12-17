package org.usyj.makgora.store.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StoreItemRequest {
    private String name;
    private String type;       // POINT or CASH
    private String category;   // FRAME / BADGE
    private Integer price;
    private Integer stock;
    private String image;
}
