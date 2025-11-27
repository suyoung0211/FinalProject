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

    @Value("${python.issue.url:http://localhost:8010/generate-issue-cards}")
    private String pythonIssueUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public void triggerAiIssueGeneration() {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<String> resp = restTemplate.exchange(
                    pythonIssueUrl,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            log.info("AI Issue 생성 응답: status={}, body={}",
                    resp.getStatusCode(), resp.getBody());

        } catch (Exception e) {
            log.error("AI Issue 생성 호출 중 에러", e);
            throw new RuntimeException("AI Issue 생성 호출 실패", e);
        }
    }
}