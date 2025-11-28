// src/main/java/org/usyj/makgora/service/AiIssueService.java
package org.usyj.makgora.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@Slf4j
public class AiIssueService {

    @Value("${python.issue.url.base:http://localhost:8000}")
    private String pythonBaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    // ------------------------------
    // 내부 공통 함수
    // ------------------------------
    private void callPython(String path, String jsonBody) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);

            ResponseEntity<String> resp = restTemplate.exchange(
                    pythonBaseUrl + path,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            log.info("[AI Issue] Python 응답: status={}, body={}",
                    resp.getStatusCode(), resp.getBody());

        } catch (Exception e) {
            log.error("[AI Issue] Python 호출 실패", e);
            throw new RuntimeException("Python Issue 생성 호출 실패", e);
        }
    }

    // ------------------------------
    // 1) 기사 기반 Issue 생성
    // ------------------------------
    public void triggerArticleIssue(int articleId) {
        String body = "{\"articleId\": " + articleId + "}";
        callPython("/generate-for-article", body);
    }

    // ------------------------------
    // 2) 커뮤니티 기반 Issue 생성
    // ------------------------------
    public void triggerCommunityIssue(long postId) {
        String body = "{\"communityPostId\": " + postId + "}";
        callPython("/generate-for-community", body);
    }
}
