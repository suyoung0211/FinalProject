// // src/main/java/org/usyj/makgora/service/IssueTriggerConsumer.java
// package org.usyj.makgora.service;

// import org.springframework.data.redis.core.StringRedisTemplate;
// import org.springframework.scheduling.annotation.Scheduled;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;
// import org.usyj.makgora.entity.RssArticleEntity;
// import org.usyj.makgora.rssfeed.repository.RssArticleRepository;

// import lombok.RequiredArgsConstructor;

// @Service
// @RequiredArgsConstructor
// public class IssueTriggerConsumer {

//     private final StringRedisTemplate redis;
//     private final RssArticleRepository articleRepo;
//     private final AiIssueService aiIssueService;

//     private static final String QUEUE = "ISSUE_TRIGGER_QUEUE";

//     @Scheduled(fixedDelay = 5000)
//     @Transactional
//     public void consume() {

//         String raw = redis.opsForList().rightPop(QUEUE);
//         if (raw == null) return;

//         // 🔹 RSS 기사 처리 (예: "article:12")
//         if (raw.startsWith("article:")) {
//             int articleId = Integer.parseInt(raw.split(":")[1]);

//             // 중복 체크
//             if ("1".equals(redis.opsForValue().get("article:" + articleId + ":triggered"))) return;

//             // Python AI 호출 → 단일 기사 Issue 생성
//             aiIssueService.triggerArticleIssue(articleId);

//             // DB에 Issue 생성 플래그 저장
//             RssArticleEntity article = articleRepo.findById(articleId).orElse(null);
//             if (article != null) {
//                 article.setIssueCreated(true);
//                 articleRepo.save(article);
//             }

//             // Redis에도 중복 방지 플래그 기록
//             redis.opsForValue().set("article:" + articleId + ":triggered", "1");

//             System.out.println("[IssueTrigger] Article Issue Created: " + articleId);
//         }

//         // 🔹 Community Post 처리 (예: "cp:33")
//         else if (raw.startsWith("cp:")) {
//             long postId = Long.parseLong(raw.split(":")[1]);

//             // 중복 체크
//             if ("1".equals(redis.opsForValue().get("cp:" + postId + ":triggered"))) return;

//             // Python AI 호출 → 단일 커뮤니티 게시글 Issue 생성
//             aiIssueService.triggerCommunityIssue(postId);

//             // Redis 중복 방지 플래그 기록
//             redis.opsForValue().set("cp:" + postId + ":triggered", "1");

//             System.out.println("[IssueTrigger] Community Issue Created: " + postId);
//         }
//     }
// }
