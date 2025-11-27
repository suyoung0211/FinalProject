// src/main/java/org/usyj/makgora/controller/AiAdminController.java
package org.usyj.makgora.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.service.AiIssueService;

@RestController
@RequestMapping("/api/admin/ai")
@RequiredArgsConstructor
public class AiAdminController {

    private final AiIssueService aiIssueService;

    @PostMapping("/issues/generate")
    public ResponseEntity<?> generateAiIssues() {
        aiIssueService.triggerAiIssueGeneration();
        return ResponseEntity.ok("AI Issue 생성 트리거 완료");
    }
}
