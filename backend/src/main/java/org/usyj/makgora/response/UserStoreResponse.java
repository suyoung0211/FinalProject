package org.usyj.makgora.response;

import org.usyj.makgora.entity.StoreItemEntity;
import org.usyj.makgora.entity.UserEntity;
import org.usyj.makgora.entity.UserStoreEntity;

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

    public static UserStoreResponse fromEntity(UserStoreEntity u) {

    StoreItemEntity item = u.getItem();
    UserEntity user = u.getUser();

    return UserStoreResponse.builder()
            .userStoreId(u.getUserStoreId())
            .userId(user.getId())
            .itemId(item.getId())
            .itemName(item.getName())
            .itemCategory(item.getCategory().name())
            .itemImage(item.getImage() != null ? item.getImage() : "❤") // 기본 대체 이미지
            .purchasedAt(u.getPurchasedAt().toString())
            .build();
}
}
