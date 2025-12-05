package org.usyj.makgora.rssfeed.dto;

import java.util.Set;

import lombok.Getter;
import lombok.Setter;

@Getter // @Getter : 실무에서 개별적으로 명확히 사용
@Setter // @Setter : Request DTO는 값 변경 필요해서 허용
public class RssFeedUpdateRequest {

    // 수정할 피드 ID
    private Integer id;

    // 새 RSS URL
    private String url;

    // 새 출처 이름
    private String sourceName;

    // 변경할 카테고리 ID 목록
    private Set<String> categoryNames;

    // ACTIVE / INACTIVE 상태
    private String status;
}