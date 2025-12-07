package org.usyj.makgora.rssfeed.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import lombok.RequiredArgsConstructor;

// 🔹 Spring Bean으로 등록된 컴포넌트
// 백엔드 실행 시 자동으로 RSS 기사 수집과 Python AI 제목 생성을 트리거
@Component
@RequiredArgsConstructor // final 필드를 생성자 주입으로 초기화
public class RssFeedCollector {

    // 🔹 FeedArticleService 주입: RSS 기사 수집 기능 담당
    private final FeedArticleService feedArticleService;

    // 🔹 RestTemplate: 외부 API 호출용
    // 여기서는 Python AI 제목 생성 API 호출에 사용
    private final RestTemplate restTemplate = new RestTemplate();

    // 🔹 Python AI 제목 생성 API URL
    private static final String PYTHON_API_URL = "http://localhost:8000/generate-ai-titles";

    // 🔹 application.properties 또는 application.yml에서 값 주입
    // 서버 시작 시 RSS 수집을 실행할지 여부 결정
    // 기본값 false → 개발 환경에서 자동 실행 방지
    @Value("${app.runRssOnStartup:false}")
    private boolean runRssOnStartup;

    /**
     * 🔹 서버 시작 시 자동 실행 메소드
     * @Async: 별도 스레드에서 실행, 서버 시작 지연 최소화
     * @EventListener(ApplicationReadyEvent.class): 스프링 컨텍스트 초기화 완료 후 호출
     */
    @Async
    @EventListener(ApplicationReadyEvent.class)
    public void runAtStartup() {
        // 설정 값에 따라 실행 여부 결정
        if (!runRssOnStartup) return;

        try {
            // 1️⃣ RSS 기사 수집
            // FeedArticleService.collectAllFeeds() 호출
            // 활성화된 모든 RSS 피드 수집
            var result = feedArticleService.collectAllFeeds();
            System.out.println("RSS 전체 수집 완료: 저장 " + result.saved() + " | 스킵 " + result.skipped());

            // 2️⃣ Python AI 제목 생성 API 호출
            // 수집 완료 기사 기반으로 AI 제목 생성
            runPythonAiTitleGeneration();

        } catch (Exception e) {
            // 예외 발생 시 스택 트레이스 출력
            // 서버 실행에는 영향 없지만 로그 기록
            e.printStackTrace();
        }
    }

    /**
     * 🔹 Python AI 제목 생성 API 호출
     * - RestTemplate POST 요청으로 Python 서버에 트리거
     * - response는 API 응답 문자열 (예: 처리 완료 메시지)
     */
    public void runPythonAiTitleGeneration() {
        try {
            String response = restTemplate.postForObject(PYTHON_API_URL, null, String.class);
            System.out.println("Python AI 제목 생성 API 응답: " + response);
        } catch (Exception e) {
            // 호출 실패 시 오류 메시지 출력
            System.err.println("Python AI 호출 실패: " + e.getMessage());
            e.printStackTrace();
        }
    }
}