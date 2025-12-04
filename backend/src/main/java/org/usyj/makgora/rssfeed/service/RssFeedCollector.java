package org.usyj.makgora.rssfeed.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class RssFeedCollector {

    private final RssFeedcollectAndSaveService rssFeedService; // RSS 기사 수집 서비스
    private final RestTemplate restTemplate = new RestTemplate(); // 외부 API 호출용 객체

    // Python AI 제목 생성 API URL
    private static final String PYTHON_API_URL = "http://localhost:8000/generate-ai-titles";

     /*
     * 개발/운영 환경에 따라 서버 시작 시 RSS 수집 자동 실행 여부를 제어
     * @Value("${app.runRssOnStartup:false}")
     * - application.properties 또는 application.yml에서 app.runRssOnStartup 값을 가져옴
     * - 값이 없으면 기본값 false 사용
     * - @Value("${app.runRssOnStartup:true}") → 서버 시작 시 runAtStartup() 실행
     * - @Value("${app.runRssOnStartup:false}") → 서버 시작 시 runAtStartup() 실행 안함
     */
    @Value("${app.runRssOnStartup:false}") // 여기를 변경
    private boolean runRssOnStartup;

    // 서버 시작 시 자동 실행
    @Async
    @EventListener(ApplicationReadyEvent.class)
    public void runAtStartup() {
        // runRssOnStartup이 false면 바로 종료 → 개발 단계에서 불필요한 작업 방지
        System.out.println("runRssOnStartup 값: " + runRssOnStartup);
        if(!runRssOnStartup) return;

        try {
            // 1️⃣ RSS 기사 수집
            rssFeedService.collectAndSaveAllFeeds();

            // 2️⃣ Python AI 제목 생성 API 호출
            // 터미널에서 pythonwoker 라이브러리로 들어가서 python generate_ai_titles_api.py 실행
            // -> pythonwoker>python generate_ai_titles_api.py
            
            var response = restTemplate.postForObject(PYTHON_API_URL, null, String.class);
            System.out.println("AI 제목 생성 API 응답: " + response);

        } catch (Exception e) {
            System.err.println("RSS 수집 또는 AI 제목 생성 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
        }
    }
}