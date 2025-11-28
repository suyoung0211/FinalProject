// src/main/java/org/usyj/makgora/controller/AiAdminController.java
package org.usyj.makgora.controller;

import lombok.RequiredArgsConstructor;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.service.AiIssueService;

@RestController
@RequestMapping("/api/admin/ai")
@RequiredArgsConstructor
public class AiAdminController {

    private final AiIssueService aiIssueService;

    // ------------------------------
    // 🔵 1) 기사 → Issue 생성
    // ------------------------------
    @PostMapping("/issues/article/generate")
    public ResponseEntity<?> generateArticleIssue(@RequestBody Map<String, Integer> body) {

        Integer articleId = body.get("articleId");
        aiIssueService.triggerArticleIssue(articleId);

        return ResponseEntity.ok("AI Article Issue 생성 완료: " + articleId);
    }

    // ------------------------------
    // 🔵 2) 커뮤니티 게시글 → Issue 생성
    // ------------------------------
    @PostMapping("/issues/community/generate")
    public ResponseEntity<?> generateCommunityIssue(@RequestBody Map<String, Long> body) {

        Long postId = body.get("postId");
        aiIssueService.triggerCommunityIssue(postId);

        return ResponseEntity.ok("AI Community Issue 생성 완료: " + postId);
    }
}
