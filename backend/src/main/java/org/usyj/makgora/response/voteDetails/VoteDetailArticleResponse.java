package org.usyj.makgora.response.voteDetails;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

/**
 * 🎯 VoteDetailArticleResponse
 * 투표 상세에서 "원본 기사 보기" 모달을 띄우기 위한 기사 데이터 전용 DTO.
 * - 기사 제목 / AI 제목
 * - 본문 / 썸네일 / 링크
 * - 카테고리 / 통계정보(조회수 등)
 */
@Data @Builder
public class VoteDetailArticleResponse {

    private Integer articleId;

    private String title;
    private String aiTitle;
    private String publisher;

    private String thumbnailUrl;
    private String link;

    private List<String> categories;

    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;

    private int viewCount;
    private int likeCount;
    private int dislikeCount;
    private int commentCount;
}
