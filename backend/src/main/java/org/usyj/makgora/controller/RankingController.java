package org.usyj.makgora.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.entity.RankingEntity.RankingType;
import org.usyj.makgora.service.RankingService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/rankings")
public class RankingController {

    private final RankingService service;

    /** 🔥 내 랭킹 조회 */
    @GetMapping("/me")
    public ResponseEntity<?> getMyRanking(Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).body("Unauthorized");

        Integer userId = Integer.parseInt(auth.getName());
        return ResponseEntity.ok(service.getMyRanking(userId));
    }

    /** 🔥 랭킹 타입별 TOP 10 */
    @GetMapping("/top/{type}")
public ResponseEntity<?> getTop10(@PathVariable RankingType type) {
    return ResponseEntity.ok(service.getTop10(type));
}

@GetMapping("/{type}")
public ResponseEntity<?> getRanking(@PathVariable RankingType type) {
    return ResponseEntity.ok(service.getRankingByType(type));
}
}
