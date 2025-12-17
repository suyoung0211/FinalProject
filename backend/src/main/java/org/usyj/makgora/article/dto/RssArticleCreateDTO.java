package org.usyj.makgora.article.dto;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Arrays;
import java.util.Comparator;

import com.rometools.rome.feed.module.Module;
import com.rometools.rome.feed.synd.SyndEntry;
import com.rometools.modules.mediarss.MediaEntryModule;
import com.rometools.modules.mediarss.types.MediaContent;

import lombok.*;

/**
 * 🔹 RSS 기사 DTO
 * - SyndEntry -> DTO 변환 시 Media RSS 썸네일 처리
 * - 콘텐츠와 카테고리 처리
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RssArticleCreateDTO {
    private String title;
    private String link;
    private String content;
    private LocalDateTime publishedAt;
    private String thumbnailUrl; // 썸네일 URL
    private List<String> categories;

    /**
     * 🔹 SyndEntry -> DTO 변환
     * - Media RSS에서 width 최대 이미지 가져오기
     * - 콘텐츠/카테고리 처리
     */
    public static RssArticleCreateDTO from(SyndEntry entry) {
        // 1️⃣ publishedAt 처리
        LocalDateTime publishedAt = null;
        if (entry.getPublishedDate() != null) {
            publishedAt = LocalDateTime.ofInstant(entry.getPublishedDate().toInstant(), ZoneId.systemDefault());
        }

        // 2️⃣ 카테고리 처리
        List<String> categories = entry.getCategories() != null
                ? entry.getCategories().stream().map(c -> c.getName()).toList()
                : List.of();

        // 3️⃣ 콘텐츠 처리
        String content = null;
        if (entry.getContents() != null && !entry.getContents().isEmpty()) {
            content = entry.getContents().get(0).getValue();
        } else if (entry.getDescription() != null) {
            content = entry.getDescription().getValue();
        }

        // 4️⃣ 썸네일 처리 (Media RSS 확장 + fallback 처리)
        String thumbnailUrl = null;
        Module module = entry.getModule(MediaEntryModule.URI);

        if (module instanceof MediaEntryModule media) {
            MediaContent[] mediaContents = media.getMediaContents();
            if (mediaContents != null && mediaContents.length > 0) {
                // width 최대값 선택
                MediaContent largest = Arrays.stream(mediaContents)
                        .filter(mc -> mc.getReference() != null)
                        .max(Comparator.comparingInt(mc -> mc.getWidth() == null ? 0 : mc.getWidth()))
                        .orElse(null);

                if (largest != null && largest.getReference() != null) {
                    thumbnailUrl = largest.getReference().toString();
                }
            }

            // media:thumbnail 추출 (fallback)
            if (thumbnailUrl == null && media.getMetadata() != null &&
                    media.getMetadata().getThumbnail() != null &&
                    media.getMetadata().getThumbnail().length > 0) {

                thumbnailUrl = media.getMetadata().getThumbnail()[0].getUrl().toString();
            }
        }

        // 5️⃣ description 내 img 태그 fallback 처리
        if (thumbnailUrl == null && content != null) {
            int imgStart = content.indexOf("<img");
            if (imgStart != -1) {
                int srcStart = content.indexOf("src=\"", imgStart) + 5;
                int srcEnd = content.indexOf("\"", srcStart);
                if (srcStart > 4 && srcEnd > srcStart) {
                    thumbnailUrl = content.substring(srcStart, srcEnd);
                }
            }
        }

        // 6️⃣ guid를 썸네일로 사용 (Media RSS/description 모두 없을 때)
        if (thumbnailUrl == null && entry.getUri() != null && entry.getUri().matches(".*\\.(jpg|jpeg|png|gif)$")) {
            thumbnailUrl = entry.getUri();
        }

        // 7️⃣ description 내 img 태그 fallback 처리
        if (thumbnailUrl == null && content != null) {
            int imgStart = content.indexOf("<img");
            if (imgStart != -1) {
                int srcStart = content.indexOf("src=\"", imgStart) + 5;
                int srcEnd = content.indexOf("\"", srcStart);
                if (srcStart > 4 && srcEnd > srcStart) {
                    thumbnailUrl = content.substring(srcStart, srcEnd);
                }
            }
        }

        // 8️⃣ DTO 빌드
        return RssArticleCreateDTO.builder()
                .title(entry.getTitle())
                .link(entry.getLink())
                .content(content)
                .publishedAt(publishedAt)
                .categories(categories)
                .thumbnailUrl(thumbnailUrl)
                .build();
    }
}
