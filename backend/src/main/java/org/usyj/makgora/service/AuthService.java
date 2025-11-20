package org.usyj.makgora.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.usyj.makgora.dto.LoginRequest;
import org.usyj.makgora.dto.LoginResponse;
import org.usyj.makgora.dto.RegisterRequest;
import org.usyj.makgora.entity.RefreshTokenEntity;
import org.usyj.makgora.entity.UserEntity;
import org.usyj.makgora.repository.RefreshTokenRepository;
import org.usyj.makgora.repository.UserRepository;
import org.usyj.makgora.security.JwtTokenProvider;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

  private final UserRepository userRepo;
  private final RefreshTokenRepository tokenRepo;
  private final PasswordEncoder encoder;
  private final JwtTokenProvider jwt;

  public void register(RegisterRequest req) {

    if (userRepo.findByEmail(req.getEmail()).isPresent())
      throw new RuntimeException("이미 존재하는 이메일입니다.");

    UserEntity user = UserEntity.builder()
        .email(req.getEmail())
        .password(encoder.encode(req.getPassword()))
        .nickname(req.getNickname())
        .build();

    userRepo.save(user);
  }

  public LoginResponse login(LoginRequest req) {

    UserEntity user = userRepo.findByEmail(req.getEmail())
        .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

    if (!encoder.matches(req.getPassword(), user.getPassword()))
      throw new RuntimeException("비밀번호 불일치");

    String accessToken = jwt.createAccessToken(user.getId(), user.getEmail(), user.getRole().name());
    String refreshToken = jwt.createRefreshToken(user.getId(), user.getEmail(), user.getRole().name());

    tokenRepo.findByUserId(user.getId()).ifPresent(tokenRepo::delete);

    tokenRepo.save(
        RefreshTokenEntity.builder()
            .userId(user.getId())
            .token(refreshToken)
            .build());

    return new LoginResponse(accessToken, refreshToken, user);
  }

  public LoginResponse reissue(String refreshToken) {

    RefreshTokenEntity token = tokenRepo.findByToken(refreshToken)
        .orElseThrow(() -> new RuntimeException("리프레시 토큰 없음"));

    UserEntity user = userRepo.findById(token.getUserId())
        .orElseThrow(() -> new RuntimeException("사용자 없음"));

    String newAccess = jwt.createAccessToken(user.getId(), user.getEmail(), user.getRole().name());
    String newRefresh = jwt.createRefreshToken(user.getId(), user.getEmail(), user.getRole().name());

    tokenRepo.deleteByUserId(user.getId());
    tokenRepo.save(
        RefreshTokenEntity.builder()
            .userId(user.getId())
            .token(newRefresh)
            .build());

    return new LoginResponse(newAccess, newRefresh, user);
  }

  public void logout(Integer userId) {
    tokenRepo.deleteByUserId(userId);
  }
}
