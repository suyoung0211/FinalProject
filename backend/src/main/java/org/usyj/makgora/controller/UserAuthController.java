package org.usyj.makgora.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.entity.UserEntity;
import org.usyj.makgora.repository.UserRepository;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
public class UserAuthController {

    private final UserRepository repo;

    @GetMapping("/me")
    public ResponseEntity<?> getMyInfo(Authentication auth) {

        System.out.println("🔎 [ME API] 요청 들어옴");

        if (auth == null) {
            System.out.println("❌ Authentication 객체가 null → JWT 인증 안 된 요청");
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String email = auth.getName();
        System.out.println("📧 인증된 사용자 email: " + email);

        UserEntity user = repo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        System.out.println("✅ 유저 조회 성공: " + user.getEmail());

        return ResponseEntity.ok(user);
    }
}
