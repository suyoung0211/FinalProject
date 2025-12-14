package org.usyj.makgora.dto.home;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Data
@Builder
public class HotIssueDto {
    private Integer id;          // 🔥 추가
    private Integer articleId;
    private String title;
    private String aiTitle;
    private String thumbnail;
    private LocalDateTime publishedAt;
    private List<String> categories;
}