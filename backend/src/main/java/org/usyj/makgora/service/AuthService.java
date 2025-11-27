package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.EmailVerificationEntity;
import org.usyj.makgora.entity.RefreshTokenEntity;
import org.usyj.makgora.entity.UserEntity;
import org.usyj.makgora.entity.UserEntity.Status;
import org.usyj.makgora.repository.EmailVerificationRepository;
import org.usyj.makgora.repository.RefreshTokenRepository;
import org.usyj.makgora.repository.UserRepository;
import org.usyj.makgora.request.auth.LoginRequest;
import org.usyj.makgora.request.auth.RegisterRequest;
import org.usyj.makgora.response.auth.LoginResponse;
import org.usyj.makgora.security.JwtTokenProvider;

@Service
@Transactional
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepo;
    private final RefreshTokenRepository tokenRepo;
    private final PasswordEncoder encoder;
    private final JwtTokenProvider jwt;
    private final EmailVerificationRepository emailVerificationRepo;

    /**
     * 회원가입
     */
    public void register(RegisterRequest req) {

        userRepo.findByEmail(req.getEmail()).ifPresent(u -> {
            throw new RuntimeException("이미 존재하는 이메일입니다.");
        });

        EmailVerificationEntity verification =
                emailVerificationRepo.findTopByEmailOrderByCreatedAtDesc(req.getVerificationEmail())
                        .orElseThrow(() -> new RuntimeException("이메일 인증 기록이 없습니다."));

        if (!verification.getVerified()) {
            throw new RuntimeException("이메일 인증을 완료해주세요.");
        }

        UserEntity user = UserEntity.builder()
                .email(req.getEmail())
                .password(encoder.encode(req.getPassword()))
                .nickname(req.getNickname())
                .verificationEmail(verification.getEmail())
                .emailVerified(true)
                .role(UserEntity.Role.USER)
                .points(0)
                .level(1)
                .status(Status.ACTIVE)
                .build();

        userRepo.save(user);
    }

    /**
     * 로그인
     */
    public LoginResponse login(LoginRequest req) {

        UserEntity user = userRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        if (!encoder.matches(req.getPassword(), user.getPassword())) {
            throw new RuntimeException("비밀번호가 올바르지 않습니다.");
        }

        // Access/Refresh Token 생성
        String accessToken = jwt.createAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwt.createRefreshToken(user.getId(), user.getEmail(), user.getRole().name());

        // 기존 토큰 제거 후 재발급
        tokenRepo.findByUserId(user.getId()).ifPresent(tokenRepo::delete);

        tokenRepo.save(
                RefreshTokenEntity.builder()
                        .userId(user.getId())
                        .token(refreshToken)
                        .build()
        );

        return new LoginResponse(accessToken, refreshToken, user);
    }

    /**
     * Refresh Token 유효성 검사
     */
    public boolean validateRefreshToken(String refreshToken) {

        // JWT 유효성 체크(만료/서명검증)
        if (!jwt.validateToken(refreshToken)) {
            tokenRepo.findByToken(refreshToken).ifPresent(tokenRepo::delete);
            return false;
        }

        // DB에 존재하는지 확인
        return tokenRepo.findByToken(refreshToken).isPresent();
    }

    /**
     * Access Token 재발급
     */
    public String reissueAccessToken(String refreshToken) {

        RefreshTokenEntity storedToken = tokenRepo.findByToken(refreshToken)
                .orElseThrow(() -> new RuntimeException("리프레시 토큰이 존재하지 않습니다."));

        UserEntity user = userRepo.findById(storedToken.getUserId())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        return jwt.createAccessToken(user.getId(), user.getEmail(), user.getRole().name());
    }

    /**
     * 로그아웃
     */
    public void logout(Integer userId) {
        tokenRepo.deleteByUserId(userId);
    }
}
