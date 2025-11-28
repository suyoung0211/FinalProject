package org.usyj.makgora.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.response.UserInfoResponse;
import org.usyj.makgora.service.UserInfoService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
public class UserAuthController {

    private final UserInfoService userInfoService;

    @GetMapping("/me")
    public ResponseEntity<?> getMyInfo(Authentication auth) {

        System.out.println("🔎 [ME API] 요청 들어옴");

        if (auth == null) {
            System.out.println("❌ Authentication 객체가 null → JWT 인증 안 된 요청");
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String loginId = auth.getName();
        System.out.println("📧 인증된 사용자 loginId: " + loginId);

        // 🔹 서비스 호출
        UserInfoResponse response = userInfoService.getMyInfo(loginId);

        System.out.println("✅ 유저 조회 성공: " + response.getNickname());

        return ResponseEntity.ok(response);
    }
}