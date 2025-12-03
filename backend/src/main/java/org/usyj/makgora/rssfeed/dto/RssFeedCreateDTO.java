package org.usyj.makgora.rssfeed.dto;

import java.util.Set;
import java.util.stream.Collectors;

import org.usyj.makgora.entity.ArticleCategoryEntity;
import org.usyj.makgora.entity.RssFeedEntity;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RssFeedCreateDTO {
    private Integer id;
    private String url;
    private String sourceName;
    private Set<String> categoryNames;

    public static RssFeedCreateDTO fromEntity(RssFeedEntity feed) {
        return RssFeedCreateDTO.builder()
                .id(feed.getId())
                .url(feed.getUrl())
                .sourceName(feed.getSourceName())
                .categoryNames(feed.getCategories().stream()
                        .map(ArticleCategoryEntity::getName)
                        .collect(Collectors.toSet()))
                .build();
    }
}