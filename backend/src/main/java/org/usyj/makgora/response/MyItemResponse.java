package org.usyj.makgora.response;


import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MyItemResponse {
    private Long userStoreId;
    private String category;  // FRAME / BADGE
    private String image;     // 이미지 URL
}