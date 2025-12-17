package org.usyj.makgora.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.global.security.CustomUserDetails;
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

        // 🔹 principal을 CustomUserDetails로 캐스팅
        // 자기 정보만 조회할 수 있게 JWT에서 가져온 userId 에서 조회
        // CustomUserDetails -> 로그인한 사용자 정보
        // getPrincipal -> 이미 JWT를 해석한 뒤 만들어진 객체
        CustomUserDetails principal = (CustomUserDetails) auth.getPrincipal();
        Integer userId = principal.getId(); // JWT에서 가져온 userId

        System.out.println("📧 인증된 사용자 loginId: " + userId);

        // 🔹 서비스 호출(토큰에 저장된 userId)
        UserInfoResponse response = userInfoService.getMyInfoById(userId);

        System.out.println("✅ 유저 조회 성공: " + response.getNickname());

        return ResponseEntity.ok(response);

        // 3️⃣ 흐름 요약
        //  1. 클라이언트 → 서버 요청 시 JWT 포함
        //  2. JWT 검증 및 파싱 (JwtTokenProvider)
        //  3. JWT의 userId를 사용해 DB에서 UserEntity 조회
        //  4. UserEntity → CustomUserDetails 객체 생성
        //  5. Authentication 객체에 넣음
        //  6. auth.getPrincipal()로 CustomUserDetails 가져오기 → 여기서 getId() 호출 가능
    }
}