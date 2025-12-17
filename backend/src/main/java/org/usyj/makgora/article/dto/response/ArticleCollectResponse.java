package org.usyj.makgora.article.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 🔹 RSS Feed 단일 수집 결과 DTO
 * - 서비스 BatchResult와 메시지를 함께 전달
 * - 메시지를 리스트로 변경하여 여러 단계 로그 전달 가능
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ArticleCollectResponse {

    private int fetched;          // 전체 파싱된 기사 수
    private int saved;            // DB에 저장된 기사 수
    private int skipped;          // 중복 등으로 저장되지 않은 기사 수
    private List<String> messages; // 프론트에서 바로 표시할 메시지 (리스트)
}