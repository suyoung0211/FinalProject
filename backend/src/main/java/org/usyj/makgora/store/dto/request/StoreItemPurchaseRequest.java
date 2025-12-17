package org.usyj.makgora.store.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StoreItemPurchaseRequest {
    private Integer itemId;
    private Integer userId;
}