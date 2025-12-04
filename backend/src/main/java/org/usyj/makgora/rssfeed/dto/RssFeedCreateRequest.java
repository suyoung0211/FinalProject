package org.usyj.makgora.rssfeed.dto;

import java.util.Set;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RssFeedCreateRequest {
    private String url;
    private String sourceName;
    private Set<Integer> categoryIds; // 카테고리 ID 리스트 전달
}