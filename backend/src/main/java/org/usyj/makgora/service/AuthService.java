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

@Transactional
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepo;
    private final RefreshTokenRepository tokenRepo;
    private final PasswordEncoder encoder;
    private final JwtTokenProvider jwt;
    private final EmailVerificationRepository emailVerificationRepo;

    /** ===========================
     *    회원가입
     * =========================== */
    public void register(RegisterRequest req) {

        if (userRepo.findByEmail(req.getEmail()).isPresent()) {
            throw new RuntimeException("이미 존재하는 이메일입니다.");
        }

        // 인증 이메일 가져오기
        EmailVerificationEntity verification =
            emailVerificationRepo.findTopByEmailOrderByCreatedAtDesc(req.getVerificationEmail())
                .orElseThrow(() -> new RuntimeException("이메일 인증 기록이 없습니다."));

        if (!verification.getVerified()) {
            throw new RuntimeException("이메일 인증을 완료해주세요.");
        }

        // 회원 저장
        UserEntity user = UserEntity.builder()
                .email(req.getEmail()) // 로그인 이메일
                .password(encoder.encode(req.getPassword()))
                .nickname(req.getNickname())
                .verificationEmail(verification.getEmail()) // 인증된 이메일 저장
                .emailVerified(true)
                .role(UserEntity.Role.USER)
                .points(0)
                .level(1)
                .status(Status.ACTIVE)
                .build();

        userRepo.save(user);
    }

    /** ===========================
 *    로그인
 * =========================== */
public LoginResponse login(LoginRequest req) {

    UserEntity user = userRepo.findByEmail(req.getEmail())
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

    if (!encoder.matches(req.getPassword(), user.getPassword())) {
        throw new RuntimeException("비밀번호 불일치");
    }

    // JWT 생성
    String accessToken = jwt.createAccessToken(
            user.getId(), user.getEmail(), user.getRole().name()
    );

    String refreshToken = jwt.createRefreshToken(
            user.getId(), user.getEmail(), user.getRole().name()
    );

    // 기존 refresh token 삭제
    tokenRepo.findByUserId(user.getId()).ifPresent(tokenRepo::delete);

    // refresh token 테이블에 저장
    tokenRepo.save(
            RefreshTokenEntity.builder()
                    .userId(user.getId())
                    .token(refreshToken)
                    .build()
    );

    // ✅ users 테이블에도 refreshToken 저장
    user.setRefreshToken(refreshToken);
    userRepo.save(user);

    return new LoginResponse(accessToken, refreshToken, user);
}


    /** ===========================
     *  토큰 재발급
     * =========================== */
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
                        .build()
        );

        return new LoginResponse(newAccess, newRefresh, user);
    }

    /** ===========================
     *  로그아웃
     * =========================== */
    
    public void logout(Integer userId) {
        tokenRepo.deleteByUserId(userId);
    }

}
