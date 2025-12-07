package org.usyj.makgora.rssfeed.service;

import java.util.Map;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import lombok.extern.slf4j.Slf4j;

/**
 * 🔹 Python AI 제목 생성 호출 서비스
 * - Python FastAPI에 POST 요청으로 AI 제목 생성 트리거
 * - 응답 JSON을 타입 안전하게 Map<String, Object>로 반환
 */
@Service
@Slf4j
public class PythonAiTitleService {

    private static final String PYTHON_API_URL = "http://localhost:8000/generate-ai-titles";

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * 🔹 Python AI 제목 생성 API 호출
     * @return Python API에서 반환한 JSON 결과를 타입 안전하게 Map<String,Object>로 반환
     */
    public Map<String, Object> generateAiTitles() {
        try {
            // ParameterizedTypeReference로 타입 안전하게 Map 구조 지정
            ParameterizedTypeReference<Map<String, Object>> typeRef =
                    new ParameterizedTypeReference<>() {};

            // exchange 메서드 사용 → POST 요청 + 응답 타입 안전 처리
            ResponseEntity<Map<String, Object>> responseEntity =
                    restTemplate.exchange(
                            PYTHON_API_URL,
                            HttpMethod.POST,
                            null,       // 본문 없음
                            typeRef
                    );

            Map<String, Object> response = responseEntity.getBody();
            log.info("Python AI 제목 생성 API 응답: {}", response);
            return response;

        } catch (Exception e) {
            log.error("Python AI 제목 생성 호출 실패: {}", e.getMessage(), e);
            throw new RuntimeException("Python AI 제목 생성 호출 실패", e);
        }
    }
}