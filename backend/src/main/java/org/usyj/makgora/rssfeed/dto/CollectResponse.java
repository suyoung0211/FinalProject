package org.usyj.makgora.rssfeed.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 🔹 RSS Feed 단일 수집 결과 DTO
 * - 서비스 BatchResult와 메시지를 함께 전달
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CollectResponse {

    private int fetched;   // 전체 파싱된 기사 수
    private int saved;     // DB에 저장된 기사 수
    private int skipped;   // 중복 등으로 저장되지 않은 기사 수
    private String message; // 프론트에서 바로 표시할 메시지
}
