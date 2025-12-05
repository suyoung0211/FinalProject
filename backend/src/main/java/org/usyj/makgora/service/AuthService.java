package org.usyj.makgora.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.EmailVerificationEntity;
import org.usyj.makgora.entity.RefreshTokenEntity;
import org.usyj.makgora.entity.UserEntity;
import org.usyj.makgora.repository.EmailVerificationRepository;
import org.usyj.makgora.repository.RefreshTokenRepository;
import org.usyj.makgora.repository.UserRepository;
import org.usyj.makgora.request.auth.LoginRequest;
import org.usyj.makgora.request.auth.RegisterRequest;
import org.usyj.makgora.response.UserInfoResponse;
import org.usyj.makgora.response.auth.LoginResponse;
import org.usyj.makgora.security.JwtTokenProvider;

import lombok.RequiredArgsConstructor;

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

        userRepo.findByLoginId(req.getLoginId()).ifPresent(u -> {
            throw new RuntimeException("이미 존재하는 이메일입니다.");
        });

        EmailVerificationEntity verification =
                emailVerificationRepo.findTopByEmailOrderByCreatedAtDesc(req.getVerificationEmail())
                        .orElseThrow(() -> new RuntimeException("이메일 인증 기록이 없습니다."));


        if (!verification.getVerified()) {
            throw new RuntimeException("이메일 인증을 완료해주세요.");
        }

        UserEntity user = UserEntity.builder()
                .loginId(req.getLoginId())
                .password(encoder.encode(req.getPassword()))
                .nickname(req.getNickname())
                .verificationEmail(verification.getEmail())
                .build();

        userRepo.save(user);
    }

    /**
     * 로그인
     */
    public LoginResponse login(LoginRequest req) {

        // 1. 사용자 조회
        // 로그인 아이디 기준 조회 → JWT 발급
        // JWT 발급 이후 API에서 userId를 쓰는 구조
        UserEntity user = userRepo.findByLoginId(req.getLoginId())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 2. 비밀번호 검증
        if (!encoder.matches(req.getPassword(), user.getPassword())) {
            throw new RuntimeException("비밀번호가 올바르지 않습니다.");
        }

        // 3. Access/Refresh Token 생성
        String accessToken = jwt.createAccessToken(user.getId(), user.getRole().name(), user.getNickname());
        String refreshToken = jwt.createRefreshToken(user.getId());

        // 4. 기존 Refresh Token 제거 후 재발급
        tokenRepo.findByUserId(user.getId()).ifPresent(tokenRepo::delete);

        tokenRepo.save(
                RefreshTokenEntity.builder()
                        .userId(user.getId())
                        .token(refreshToken)
                        .build()
        );

        // 5. 유저 정보 → 안전한 DTO로 변환
        UserInfoResponse safeUser = new UserInfoResponse(
                user.getLoginId(),
                user.getNickname(),
                user.getLevel(),
                user.getPoints(),

                user.getAvatarIcon(),     // 수정됨
                user.getProfileFrame(),   // 수정됨
                user.getProfileBadge(),   // 수정됨

                user.getRole().name()   
        );

        // 6. 로그인 성공 응답
        return new LoginResponse(accessToken, refreshToken, safeUser);
    }

    /**
     * Refresh Token 유효성 검사
     */
    public boolean validateRefreshToken(String refreshToken) {

        // JWT 유효성 체크
        if (!jwt.validateToken(refreshToken)) {
            tokenRepo.findByToken(refreshToken).ifPresent(tokenRepo::delete);
            return false;
        }

        // DB에Refresh Token 존재하는지 확인
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

        return jwt.createAccessToken(user.getId(), user.getLoginId(), user.getRole().name());
    }

    /**
     * 로그아웃
     */
    public void logout(Integer userId) {
        tokenRepo.deleteByUserId(userId);
    }
}
