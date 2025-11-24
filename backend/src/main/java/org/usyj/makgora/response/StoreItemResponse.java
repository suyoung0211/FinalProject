package org.usyj.makgora.response;

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
}