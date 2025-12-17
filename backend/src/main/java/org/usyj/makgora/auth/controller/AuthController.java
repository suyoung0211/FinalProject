package org.usyj.makgora.auth.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.auth.dto.request.LoginRequest;
import org.usyj.makgora.auth.dto.request.RegisterRequest;
import org.usyj.makgora.auth.dto.response.LoginResponse;
import org.usyj.makgora.auth.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * 현재 활성화된 Spring Profile
     * - 값이 없으면 local
     * - prod 인 경우에만 HTTPS 기준 쿠키 설정
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
            // 회원가입 실패는 클라이언트 입력 문제이므로 400
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
            // 1️⃣ 인증 성공 시 AccessToken + RefreshToken 발급
            LoginResponse loginResponse = authService.login(req);

            // 2️⃣ RefreshToken을 HttpOnly 쿠키로 저장
            // - JS 접근 차단
            // - AccessToken 탈취 시에도 재발급 가능
            Cookie refreshCookie = createRefreshTokenCookie(
                    loginResponse.getRefreshToken(),
                    14 * 24 * 60 * 60 // 14일
            );
            response.addCookie(refreshCookie);

            System.out.println("✅ [AUTH] 로그인 성공 - RefreshToken 쿠키 저장");

            // 3️⃣ AccessToken + 사용자 정보는 Response Body로 반환
            return ResponseEntity.ok(loginResponse);

        } catch (Exception e) {
            // 로그인 실패는 인증 실패 → 401
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(e.getMessage());
        }
    }

    /* =====================================================
     * Access Token 재발급 (Refresh Token 사용)
     *
     * ⚠️ 이 API는 절대 500을 반환하면 안 된다
     * ⚠️ 어떤 예외가 발생해도 결과는 "인증 실패(401)"여야 한다
     * ===================================================== */
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(
            @CookieValue(name = "refreshToken", required = false) String refreshToken
    ) {
        try {
            // 1️⃣ 쿠키 자체가 없는 경우
            // - 아직 로그인 안 했거나
            // - 이미 로그아웃된 상태
            if (refreshToken == null) {
                System.out.println("❌ [AUTH] Refresh 실패 - 쿠키 없음");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            // 2️⃣ RefreshToken 유효성 + DB 존재 여부 검사
            // - 만료
            // - 위조
            // - DB에서 삭제됨
            if (!authService.validateRefreshToken(refreshToken)) {
                System.out.println("❌ [AUTH] Refresh 실패 - 유효하지 않은 RefreshToken");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            // 3️⃣ AccessToken 재발급
            String newAccessToken = authService.reissueAccessToken(refreshToken);

            System.out.println("🔄 [AUTH] RefreshToken 사용 → AccessToken 재발급 완료");

            // 4️⃣ AccessToken만 반환
            // - RefreshToken은 기존 쿠키 그대로 유지
            return ResponseEntity.ok(
                    new LoginResponse(newAccessToken, null, null)
            );

        } catch (Exception e) {
            /**
             * 🔥 가장 중요한 부분
             *
             * Refresh 과정에서 발생하는 모든 예외는
             * - JWT 파싱 실패
             * - DB 조회 실패
             * - NullPointerException
             *
             * 전부 "인증 실패"로 처리해야 한다.
             * 절대 500으로 보내면 안 된다.
             */
            System.out.println("❌ [AUTH] Refresh 처리 중 예외 발생: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    /* =====================================================
     * 로그아웃
     * ===================================================== */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @CookieValue(name = "refreshToken", required = false) String refreshToken,
            HttpServletResponse response
    ) {
        try {
            // 1️⃣ DB에 저장된 RefreshToken 제거
            // - 이 브라우저 세션만 무효화
            authService.logout(refreshToken);

        } catch (Exception e) {
            // 로그아웃은 실패해도 클라이언트에 에러를 줄 필요 없음
            // (이미 로그아웃된 상태일 수도 있음)
        }

        // 2️⃣ RefreshToken 쿠키 즉시 삭제
        Cookie deleteCookie = createRefreshTokenCookie(null, 0);
        response.addCookie(deleteCookie);

        System.out.println("🚪 [AUTH] 로그아웃 완료");

        return ResponseEntity.ok("Logged out");
    }

    /* =====================================================
     * 공통 유틸 메서드
     * ===================================================== */

    /**
     * 운영 환경 여부 판단
     */
    private boolean isProduction() {
        return "prod".equalsIgnoreCase(activeProfile);
    }

    /**
     * RefreshToken 쿠키 생성
     *
     * ⚠️ 로그인 / 리프레시 / 로그아웃에서
     * ⚠️ 반드시 동일한 옵션을 사용해야 한다
     */
    private Cookie createRefreshTokenCookie(String value, int maxAge) {

        boolean isProd = isProduction();

        Cookie cookie = new Cookie("refreshToken", value);

        cookie.setHttpOnly(true);      // JS 접근 차단 (XSS 방지)
        cookie.setSecure(isProd);      // prod: HTTPS 필수
        cookie.setPath("/");           // 모든 API 요청에 포함
        cookie.setMaxAge(maxAge);      // 0이면 즉시 삭제

        // 프론트/백엔드 도메인이 다르면 None 필수
        cookie.setAttribute(
                "SameSite",
                isProd ? "None" : "Lax"
        );

        return cookie;
    }
}
