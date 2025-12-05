package org.usyj.makgora.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.usyj.makgora.request.auth.LoginRequest;
import org.usyj.makgora.request.auth.RegisterRequest;
import org.usyj.makgora.response.auth.LoginResponse;
import org.usyj.makgora.service.AuthService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /** 회원가입 */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        try {
            authService.register(req);
            return ResponseEntity.ok("Registered");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /** 로그인 */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req, HttpServletResponse response) {
        try {
            // DB에서 Access/Refresh Token + User 정보를 응답 객체로 받음
            LoginResponse loginResponse = authService.login(req);

            // -----------------------------------------
            // ⭐ Refresh Token을 HttpOnly Cookie로 저장
            //   → 자바스크립트 접근 차단(XSS 방지)
            //   → 자동 전송 (권한이 필요하지 않은 /auth/refresh 요청에서도)
            // -----------------------------------------
            Cookie refreshCookie = new Cookie("refreshToken", loginResponse.getRefreshToken());

            refreshCookie.setHttpOnly(true); // JS로 접근 막음 → 보안 강화
            refreshCookie.setSecure(false);  // ⭐ 개발환경(http)에서는 false / 운영환경(https)에서는 true
            refreshCookie.setPath("/");      // 모든 경로 요청에서 자동 전송되도록 설정
            refreshCookie.setMaxAge(14 * 24 * 60 * 60); // 14일 유지

            // ⭐ 핵심: CORS 환경에서는 SameSite=None 이 필수!
            // SameSite=Lax/Strict → 다른 도메인에서 쿠키 전송 불가
            // refreshCookie.setAttribute("SameSite", "None"); // ✅ 이 줄은 잠시 주석 처리

            // 쿠키를 실제 Response에 추가
            response.addCookie(refreshCookie);

            // 클라이언트에게 Access Token + 사용자 정보 반환
            return ResponseEntity.ok(loginResponse);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    /** Access Token 재발급 */
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(
            @CookieValue(name = "refreshToken", required = false) String refreshToken) {

        if (refreshToken == null || !authService.validateRefreshToken(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String newAccessToken = authService.reissueAccessToken(refreshToken);

        // Access Token만 전달
        return ResponseEntity.ok(
                new LoginResponse(newAccessToken, null, null)
        );
    }

    /** 로그아웃 */
    @PostMapping("/logout") // ✅ 수정 @PostMapping("/logout"/{userId}) -> @PostMapping("/logout")
    public ResponseEntity<?> logout(@CookieValue(name = "refreshToken", required = false) String refreshToken, HttpServletResponse response) {

        // 1) DB에서 해당 RT 삭제 (이 브라우저 세션 무효화
        authService.logout(refreshToken);

        // 2) 쿠키도 삭제
        Cookie refreshCookie = new Cookie("refreshToken", null);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(false); // 운영에서 https면 true
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(0); // 즉시 만료
        response.addCookie(refreshCookie);

        return ResponseEntity.ok("Logged out");
    }
}
/* 
✅ 현재 방식 : userId 전체 토큰 삭제 방식으로 구현됨
-> 특정 기기 로그아웃이 아닌 "해당 유저의 모든 기기 로그아웃"임

refresh token 전달? ❌
cookie에서 읽기? ❌
body에서 받기? ❌
👉 삭제해야 할 대상 토큰 자체가 없음 → DB에서 삭제할 방법이 없음.
❌ “형식적 로그아웃(O)”
❌ “실제 보안 로그아웃(X)”

=> Refresh Token을 전달받지 않는다
=> 로그아웃 = “특정 Refresh Token을 DB에서 삭제”
*/