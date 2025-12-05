// // // src/main/java/org/usyj/makgora/service/IssueTriggerConsumer.java
// package org.usyj.makgora.service;

// import java.time.Duration;

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
//     private final RssArticleScoreService scoreService;

//     private static final String QUEUE = "ISSUE_TRIGGER_QUEUE";

//     private boolean acquireLock(String key) {
//         Boolean ok = redis.opsForValue()
//                 .setIfAbsent(key, "LOCK", Duration.ofMinutes(5));
//         return Boolean.TRUE.equals(ok);
//     }

//     // @Scheduled(fixedDelay = 60 * 1000) // 1시간마다
//     @Transactional
//     public void consume() {

//         String raw = redis.opsForList().rightPop(QUEUE);
//         if (raw == null) return;

//         /* ============================
//            📌 RSS Article Issue
//         ============================ */
//         if (raw.startsWith("article:")) {

//             int articleId = Integer.parseInt(raw.split(":")[1]);

//             String lockKey = "article:" + articleId + ":issue:lock";

//             // 🔥 중복 소비 방지 (SETNX)
//             if (!acquireLock(lockKey)) {
//                 System.out.println("[Consumer] LOCKED → Skip articleId: " + articleId);
//                 return;
//             }

//             try {
//                 // 이미 완료된 article이면 skip
//                 if ("1".equals(redis.opsForValue().get("article:" + articleId + ":triggered"))) return;

//                 aiIssueService.triggerArticleIssue(articleId);

//                 RssArticleEntity article = articleRepo.findById(articleId).orElse(null);
//                 if (article != null) {
//                     int score = scoreService.updateScoreAndReturn(article);
//                     article.setAiSystemScore(score);
//                     article.setIssueCreated(true);
//                     articleRepo.save(article);
//                 }

//                 redis.opsForValue().set("article:" + articleId + ":triggered", "1");

//                 System.out.println("[IssueTrigger] Article Issue Created: " + articleId);
//             }
//             finally {
//                 // 🔥 lock 해제
//                 redis.delete(lockKey);
//             }
//         }

//         /* ============================
//            📌 Community Issue
//         ============================ */
//         else if (raw.startsWith("cp:")) {

//             long postId = Long.parseLong(raw.split(":")[1]);

//             String lockKey = "cp:" + postId + ":issue:lock";

//             if (!acquireLock(lockKey)) {
//                 System.out.println("[Consumer] LOCKED → Skip postId: " + postId);
//                 return;
//             }

//             try {
//                 if ("1".equals(redis.opsForValue().get("cp:" + postId + ":triggered"))) return;

//                 aiIssueService.triggerCommunityIssue(postId);

//                 redis.opsForValue().set("cp:" + postId + ":triggered", "1");

//                 System.out.println("[IssueTrigger] Community Issue Created: " + postId);
//             }
//             finally {
//                 redis.delete(lockKey);
//             }
//         }
//     }
// }
