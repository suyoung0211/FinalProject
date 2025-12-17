package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.EmailVerificationEntity;
import org.usyj.makgora.entity.RefreshTokenEntity;
import org.usyj.makgora.entity.UserEntity;
import org.usyj.makgora.global.security.JwtTokenProvider;
import org.usyj.makgora.repository.EmailVerificationRepository;
import org.usyj.makgora.repository.RefreshTokenRepository;
import org.usyj.makgora.repository.UserRepository;
import org.usyj.makgora.request.auth.LoginRequest;
import org.usyj.makgora.request.auth.RegisterRequest;
import org.usyj.makgora.response.UserInfoResponse;
import org.usyj.makgora.response.auth.LoginResponse;

@Service
@Transactional
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepo;
    private final RefreshTokenRepository refreshTokenRepo;
    private final PasswordEncoder encoder;
    private final JwtTokenProvider jwt;
    private final EmailVerificationRepository emailVerificationRepo;

    // =============================================================
    // 1️⃣ 회원가입
    // =============================================================
    public void register(RegisterRequest req) {

        // 🔹 로그인 아이디 중복 체크
        userRepo.findByLoginId(req.getLoginId()).ifPresent(u -> {
            throw new RuntimeException("이미 존재하는 이메일입니다.");
        });

        // 🔹 가장 최근 이메일 인증 기록 조회
        EmailVerificationEntity verification =
                emailVerificationRepo
                        .findTopByEmailOrderByCreatedAtDesc(req.getVerificationEmail())
                        .orElseThrow(() -> new RuntimeException("이메일 인증 기록이 없습니다."));

        if (!verification.getVerified()) {
            throw new RuntimeException("이메일 인증을 완료해주세요.");
        }

        // 🔹 사용자 생성
        UserEntity user = UserEntity.builder()
                .loginId(req.getLoginId())
                .password(encoder.encode(req.getPassword())) // 비밀번호 해싱
                .nickname(req.getNickname())
                .verificationEmail(verification.getEmail())
                .build();

        userRepo.save(user);
    }

    // =============================================================
    // 2️⃣ 로그인
    // =============================================================
    public LoginResponse login(LoginRequest req) {

        // 1. 사용자 조회
        UserEntity user = userRepo.findByLoginId(req.getLoginId())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 2. 비밀번호 검증
        if (!encoder.matches(req.getPassword(), user.getPassword())) {
            throw new RuntimeException("비밀번호가 올바르지 않습니다.");
        }

        // 3. Access Token 생성 (stateless)
        String accessToken =
                jwt.createAccessToken(
                        user.getId(),
                        user.getRole().name(),
                        user.getNickname()
                );

        // 4. Refresh Token 생성 (jti 포함)
        JwtTokenProvider.RefreshTokenResult refreshResult =
                jwt.createRefreshToken(user.getId());

        // 5. 기존 Refresh Token 전부 제거 (1인 1세션 정책)
        // 👉 여러 기기 허용하려면 이 줄 제거
        refreshTokenRepo.deleteAllByUser_Id(user.getId());

        // 6. Refresh Token DB 저장 (jti 기준)
        refreshTokenRepo.save(
                RefreshTokenEntity.builder()
                        .user(user)
                        .jti(refreshResult.getJti())
                        .expiresAt(refreshResult.getExpiresAt())
                        .build()
        );

        // 7. 안전한 유저 정보 DTO
        UserInfoResponse safeUser = new UserInfoResponse(
                user.getLoginId(),
                user.getNickname(),
                user.getLevel(),
                user.getPoints(),
                user.getAvatarIcon(),
                user.getProfileFrame(),
                user.getProfileBadge(),
                user.getRole().name()
        );

        // 8. 응답 (Refresh Token은 쿠키로 내려가는 전제)
        return new LoginResponse(
                accessToken,
                refreshResult.getToken(),
                safeUser
        );
    }

    // =============================================================
    // 3️⃣ Refresh Token 유효성 검사
    // =============================================================
    public boolean validateRefreshToken(String refreshToken) {

        // 1. JWT 서명 / 만료 검증
        if (!jwt.validateToken(refreshToken)) {
            return false;
        }

        // 2. jti 추출
        String jti = jwt.getJti(refreshToken);

        // 3. DB에 해당 jti 존재 여부 확인
        return refreshTokenRepo.findByJti(jti).isPresent();
    }

    // =============================================================
    // 4️⃣ Access Token 재발급
    // =============================================================
    public String reissueAccessToken(String refreshToken) {

        // 1. JWT 검증
        if (!jwt.validateToken(refreshToken)) {
            throw new RuntimeException("Refresh Token이 유효하지 않습니다.");
        }

        // 2. jti 추출
        String jti = jwt.getJti(refreshToken);

        // 3. DB에서 Refresh Token 조회
        RefreshTokenEntity storedToken =
                refreshTokenRepo.findByJti(jti)
                        .orElseThrow(() -> new RuntimeException("Refresh Token이 존재하지 않습니다."));

        // 4. 사용자 조회
        UserEntity user = storedToken.getUser();

        // 5. 새로운 Access Token 발급
        return jwt.createAccessToken(
                user.getId(),
                user.getRole().name(),
                user.getNickname()
        );
    }

    // =============================================================
    // 5️⃣ 로그아웃
    // =============================================================
    public void logout(String refreshToken) {

        if (refreshToken == null || refreshToken.isBlank()) {
            return;
        }

        // 🔹 JWT 검증 실패여도 로그아웃은 진행
        try {
            String jti = jwt.getJti(refreshToken);
            refreshTokenRepo.deleteByJti(jti);
        } catch (Exception ignored) {
            // 이미 만료되었거나 위조된 경우 → DB에 없으면 그냥 무시
        }
    }
}
