package org.usyj.makgora.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.request.auth.LoginRequest;
import org.usyj.makgora.request.auth.RegisterRequest;
import org.usyj.makgora.response.auth.LoginResponse;
import org.usyj.makgora.service.AuthService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

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
            // db 로부터 accessToken, refreshToken, user 받음
            LoginResponse loginResponse = authService.login(req);

            // ⭐ Refresh Token을 HttpOnly 쿠키로 저장
            Cookie refreshCookie = new Cookie("refreshToken", loginResponse.getRefreshToken());
            refreshCookie.setHttpOnly(true);
            refreshCookie.setSecure(false); // 로컬 개발환경에서는 false, 운영 HTTPS환경에서는 true
            refreshCookie.setPath("/");
            refreshCookie.setMaxAge(14 * 24 * 60 * 60); // 14일
            response.addCookie(refreshCookie);

            // 클라이언트에 보낼 응답 → Access Token + User 정보만 포함
            LoginResponse responseBody = new LoginResponse(
                    loginResponse.getAccessToken(),
                    null,
                    loginResponse.getUser()
            );

            return ResponseEntity.ok(responseBody);
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
    @PostMapping("/logout/{userId}")
    public ResponseEntity<?> logout(@PathVariable Integer userId, HttpServletResponse response) {
        authService.logout(userId);

        // Refresh Token 쿠키 삭제 처리
        Cookie refreshCookie = new Cookie("refreshToken", null);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(false);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(0);
        response.addCookie(refreshCookie);

        return ResponseEntity.ok("Logged out");
    }
}
