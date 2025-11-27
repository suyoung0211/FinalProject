package org.usyj.makgora.rssfeed.service;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.usyj.makgora.rssfeed.repository.ArticleAiTitleRepository;

@Component
@RequiredArgsConstructor
public class RssFeedCollector {

    private final RssFeedService rssFeedService;
    private final ArticleAiTitleRepository aiTitleRepository;
    private final RestTemplate restTemplate = new RestTemplate(); // API 호출용

    // Python AI 제목 생성 API URL
    private static final String PYTHON_API_URL = "http://localhost:8000/generate-ai-titles";

    // 서버 시작 시 자동 실행
    @EventListener(ApplicationReadyEvent.class)
    @Async
    public void runAtStartup() {
        try {
            // 1️⃣ RSS 기사 수집
            // rssFeedService.collectAndSaveAllFeeds();

            // // 2️⃣ Python AI 제목 생성 API 호출
            // // 터미널에서 pythonwoker 라이브러리로 들어가서 python generate_ai_titles_api.py 실행
            // // -> pythonwoker>python generate_ai_titles_api.py
            
            // var response = restTemplate.postForObject(PYTHON_API_URL, null, String.class);
            // long successCount = aiTitleRepository.countByStatus("SUCCESS");
            // System.out.println("AI 제목 생성 API 응답: " + response);
            // System.out.println("생성된 AI 제목 개수: " + successCount);

        } catch (Exception e) {
            System.err.println("RSS 수집 또는 AI 제목 생성 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
        }
    }
}