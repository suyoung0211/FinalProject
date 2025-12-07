package org.usyj.makgora.rssfeed.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

/**
 * 🔹 Spring Bean으로 등록된 컴포넌트
 * 
 * 역할:
 * - 서버 시작 시 자동으로 RSS 기사 수집과 Python AI 제목 생성을 트리거
 * - Python AI 제목 생성 API 호출 시 PythonAiTitleService를 활용하여 Map으로 안전하게 응답 처리
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RssFeedCollector {

    // 🔹 FeedArticleService 주입: RSS 기사 수집 기능 담당
    private final FeedArticleService feedArticleService;

    // 🔹 PythonAiTitleService 주입: Python FastAPI 호출 담당
    private final PythonAiTitleService pythonAiTitleService;

    // 🔹 application.properties 또는 application.yml에서 값 주입
    // 서버 시작 시 RSS 수집을 실행할지 여부 결정
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
            var result = feedArticleService.collectAllFeeds();
            log.info("RSS 전체 수집 완료: 저장={} | 스킵={}", result.saved(), result.skipped());

            // 2️⃣ Python AI 제목 생성 API 호출
            runPythonAiTitleGeneration();

        } catch (Exception e) {
            log.error("RSS 수집 또는 Python AI 호출 중 예외 발생", e);
        }
    }

    /**
     * 🔹 Python AI 제목 생성 API 호출
     * 
     * 동작:
     * 1) PythonAiTitleService.generateAiTitles() 호출 → Map<String,Object>로 안전하게 응답 처리
     * 2) API 호출 성공 시 로그 출력
     * 3) 호출 실패 시 예외 전파
     */
    public void runPythonAiTitleGeneration() {
        try {
            // PythonAiTitleService 호출만 수행
            pythonAiTitleService.generateAiTitles();
        } catch (Exception e) {
            log.error("Python AI 제목 생성 호출 실패", e);
        }
    }
}
