package org.usyj.makgora.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import org.usyj.makgora.dto.*;
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

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {

        System.out.println("🔍 [LOGIN] 요청 들어옴");
        System.out.println("📧 Email = " + req.getEmail());
        System.out.println("🔑 Password = " + req.getPassword());

        try {

            // AuthenticationManager로 인증 시도
            Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    req.getEmail(), req.getPassword())
            );

            System.out.println("✅ AuthenticationManager 인증 성공");

            UserEntity user = repo.findByEmail(req.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            System.out.println("✅ User 조회 성공: " + user.getEmail());

            // JWT 생성
            String accessToken = jwtTokenProvider.createAccessToken(
                    user.getId(),
                    user.getEmail(),
                    user.getRole().name()
            );

            String refreshToken = jwtTokenProvider.createRefreshToken(
                    user.getId(),
                    user.getEmail(),
                    user.getRole().name()
            );

            System.out.println("🎉 JWT 발급 완료");

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

    // ⭐ 비밀번호 암호화
    user.setPassword(passwordEncoder.encode(req.getPassword()));

    repo.save(user);

    System.out.println("✅ 회원가입 성공: " + user.getEmail());

    return ResponseEntity.ok("Registered");
}
}
