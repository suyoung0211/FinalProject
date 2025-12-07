package org.usyj.makgora.rssfeed.source;

import org.springframework.stereotype.Component;
import java.util.Map;
import java.util.HashMap;

/**
 * 🔹 SourceRegistry
 * - sourceName -> RssFeedSource 구현체 매핑 관리
 * - collectAllFeeds() 등에서 DB 피드를 읽고 Source 객체를 가져올 때 사용
 */
@Component
public class SourceRegistry {

    // key: sourceName, value: RssFeedSource 객체
    private final Map<String, RssFeedSource> sourceMap = new HashMap<>();

    // ========================
    // 🔹 등록
    // ========================
    public void registerSource(String name, RssFeedSource source) {
        sourceMap.put(name, source);
    }

    // ========================
    // 🔹 조회
    // ========================
    public RssFeedSource getSource(String name) {
        RssFeedSource source = sourceMap.get(name);
        if (source == null) {
            throw new IllegalArgumentException("등록되지 않은 sourceName: " + name);
        }
        return source;
    }
}
