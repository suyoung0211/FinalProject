package org.usyj.makgora.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import org.usyj.makgora.dto.*;
import org.usyj.makgora.entity.UserEntity;
import org.usyj.makgora.repository.UserRepository;
import org.usyj.makgora.security.JwtTokenProvider;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthenticationManager authenticationManager;
  private final JwtTokenProvider jwtTokenProvider;
  private final UserRepository repo;

  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody LoginRequest req) {

    Authentication auth = authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(
            req.getEmail(), req.getPassword()));

    UserEntity user = repo.findByEmail(req.getEmail()).get();

    // ⭐ Access / Refresh 분리
    String accessToken = jwtTokenProvider.createAccessToken(
        user.getId(),
        user.getEmail(),
        user.getRole().name());

    String refreshToken = jwtTokenProvider.createRefreshToken(
        user.getId(),
        user.getEmail(),
        user.getRole().name());

    // 응답 객체 생성
    LoginResponse response = new LoginResponse(accessToken, refreshToken, user);

    return ResponseEntity.ok(response);
  }
}
