package org.usyj.makgora.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.request.auth.LoginRequest;
import org.usyj.makgora.request.auth.RegisterRequest;
import org.usyj.makgora.response.auth.LoginResponse;
import org.usyj.makgora.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * 현재 활성화된 Spring Profile
     * - 값이 없으면 local 로 처리
     * - Docker / Render / EC2 에서도 안전
     */
    @Value("${spring.profiles.active:local}")
    private String activeProfile;

    /* =====================================================
     * 회원가입
     * ===================================================== */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        try {
            authService.register(req);
            return ResponseEntity.ok("Registered");
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    /* =====================================================
     * 로그인
     * ===================================================== */
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest req,
            HttpServletResponse response
    ) {
        try {
            // 1️⃣ AccessToken / RefreshToken 발급
            LoginResponse loginResponse = authService.login(req);

            // 2️⃣ RefreshToken을 HttpOnly Cookie로 저장
            Cookie refreshCookie = createRefreshTokenCookie(
                    loginResponse.getRefreshToken(),
                    14 * 24 * 60 * 60 // 14일 유지
            );

            response.addCookie(refreshCookie);

            System.out.println("✅ [AUTH] 로그인 성공 - RefreshToken 쿠키 저장");

            // 3️⃣ AccessToken + 사용자 정보 반환
            return ResponseEntity.ok(loginResponse);

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(e.getMessage());
        }
    }

    /* =====================================================
     * Access Token 재발급 (Refresh Token 사용)
     * ===================================================== */
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(
            @CookieValue(name = "refreshToken", required = false) String refreshToken
    ) {
        // 1️⃣ 쿠키 자체가 없는 경우
        if (refreshToken == null) {
            System.out.println("❌ [AUTH] Refresh 요청 실패 - 쿠키 없음");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 2️⃣ RefreshToken 유효성 + DB 존재 여부 검사
        if (!authService.validateRefreshToken(refreshToken)) {
            System.out.println("❌ [AUTH] Refresh 요청 실패 - 유효하지 않은 RefreshToken");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 3️⃣ AccessToken 재발급
        String newAccessToken = authService.reissueAccessToken(refreshToken);

        // ⭐ 여기 로그가 찍히면 "리프레시 토큰으로 갱신됨"이 100% 확실
        System.out.println("🔄 [AUTH] RefreshToken 사용 → AccessToken 재발급 완료");

        // 4️⃣ AccessToken만 응답 (RefreshToken은 쿠키에 그대로 유지)
        return ResponseEntity.ok(
                new LoginResponse(newAccessToken, null, null)
        );
    }

    /* =====================================================
     * 로그아웃
     * ===================================================== */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @CookieValue(name = "refreshToken", required = false) String refreshToken,
            HttpServletResponse response
    ) {
        // 1️⃣ DB에서 RefreshToken 삭제 (이 브라우저 세션 무효화)
        authService.logout(refreshToken);

        // 2️⃣ 쿠키 즉시 삭제
        Cookie deleteCookie = createRefreshTokenCookie(
                null,
                0 // 🔥 MaxAge = 0 → 브라우저에 "즉시 삭제" 명령
        );

        response.addCookie(deleteCookie);

        System.out.println("🚪 [AUTH] 로그아웃 완료 - RefreshToken 삭제");

        return ResponseEntity.ok("Logged out");
    }

    /* =====================================================
     * 공통 유틸 메서드
     * ===================================================== */

    /**
     * 운영 환경 여부 판단
     * - prod → 운영
     * - local / dev → 로컬
     */
    private boolean isProduction() {
        return "prod".equalsIgnoreCase(activeProfile);
    }

    /**
     * RefreshToken 쿠키 생성 공통 메서드
     *
     * ⚠️ 로그인 / 리프레시 / 로그아웃에서
     * ⚠️ 반드시 동일한 옵션을 사용해야 함
     */
    private Cookie createRefreshTokenCookie(String value, int maxAge) {

        boolean isProd = isProduction();

        Cookie cookie = new Cookie("refreshToken", value);

        cookie.setHttpOnly(true);          // JS 접근 차단 (XSS 방지)
        cookie.setSecure(isProd);          // 운영(HTTPS)=true / 로컬(HTTP)=false
        cookie.setPath("/");               // 전체 API 요청에서 전송
        cookie.setMaxAge(maxAge);          // 0이면 즉시 삭제

        // 프론트/백엔드 도메인이 다르면 None 필수
        cookie.setAttribute(
                "SameSite",
                isProd ? "None" : "Lax"
        );

        return cookie;
    }
}
