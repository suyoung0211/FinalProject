package org.usyj.makgora.response;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class UserStoreResponse {
    private Long userStoreId;
    private Integer userId;
    private Integer itemId;
    private String itemName;
    private String itemCategory;
    private String itemImage;
    private String purchasedAt;
}
