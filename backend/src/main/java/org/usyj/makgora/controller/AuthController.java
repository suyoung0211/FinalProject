package org.usyj.makgora.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import org.usyj.makgora.dto.*;
import org.usyj.makgora.dto.request.LoginRequest;
import org.usyj.makgora.dto.request.RegisterRequest;
import org.usyj.makgora.dto.response.LoginResponse;
import org.usyj.makgora.entity.UserEntity;
import org.usyj.makgora.repository.UserRepository;
import org.usyj.makgora.security.JwtTokenProvider;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository repo;
    private final PasswordEncoder passwordEncoder;

    // =============================
    // ⭐ 로그인
    // =============================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {

        System.out.println("🔍 [LOGIN] 요청 들어옴");
        System.out.println("📧 Email = " + req.getEmail());

        try {
            // 1) AuthenticationManager 로 인증
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            req.getEmail(), req.getPassword())
            );
            System.out.println("✅ Authentication 인증 성공");

            // 2) DB에서 사용자 조회
            UserEntity user = repo.findByEmail(req.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            System.out.println("✅ User 조회 성공: " + user.getEmail());

            // 3) JWT 발급
            String accessToken = jwtTokenProvider.createAccessToken(
                    user.getId(), user.getEmail(), user.getRole().name()
            );

            String refreshToken = jwtTokenProvider.createRefreshToken(
                    user.getId(), user.getEmail(), user.getRole().name()
            );

            System.out.println("🎉 JWT 발급 완료");

            // ⭐ 4) refreshToken DB 저장
            user.setRefreshToken(refreshToken);
            repo.save(user);

            LoginResponse response = new LoginResponse(accessToken, refreshToken, user);

            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            System.out.println("❌ 비밀번호 불일치");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password");
        } catch (Exception e) {
            System.out.println("❌ 로그인 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login failed: " + e.getMessage());
        }
    }

    // =============================
    // ⭐ 회원가입
    // =============================
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {

        System.out.println("🔍 회원가입 요청 email: " + req.getEmail());

        if (repo.findByEmail(req.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        UserEntity user = new UserEntity();
        user.setEmail(req.getEmail());
        user.setNickname(req.getNickname());
        user.setRole(UserEntity.Role.USER);
        user.setPoints(0);
        user.setLevel(1);

        // 비밀번호 암호화
        user.setPassword(passwordEncoder.encode(req.getPassword()));

        // ⭐ refreshToken은 로그인시에만 저장
        user.setRefreshToken(null);

        repo.save(user);

        System.out.println("✅ 회원가입 성공: " + user.getEmail());
        return ResponseEntity.ok("Registered");
    }
    @PostMapping("/logout")
    public ResponseEntity<?> logout(Authentication auth) {
        System.out.println("🚪 [LOGOUT] 요청 들어옴");

        if (auth == null) {
            System.out.println("❌ 인증 안 된 요청에서 로그아웃 시도");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not logged in");
        }

        String email = auth.getName();
        System.out.println("📧 로그아웃 사용자 email: " + email);

        // (선택) refreshToken 을 DB에 저장하고 있다면 여기서 제거
        repo.findByEmail(email).ifPresent(user -> {
            try {
                user.setRefreshToken(null);   // ⚠ UserEntity에 필드 있어야 함
                repo.save(user);
                System.out.println("🧹 DB refreshToken 제거 완료");
            } catch (Exception e) {
                System.out.println("⚠ refreshToken 제거 중 오류: " + e.getMessage());
            }
        });

        // SecurityContext 비우기
        SecurityContextHolder.clearContext();
        System.out.println("✅ SecurityContext 클리어 완료");

        return ResponseEntity.ok("Logged out");
    }
}
