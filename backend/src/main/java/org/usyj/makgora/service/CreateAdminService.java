package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.usyj.makgora.entity.UserEntity;
import org.usyj.makgora.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class CreateAdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * 새로운 관리자 생성
     * @param loginId 로그인 ID
     * @param nickname 닉네임
     * @param password 비밀번호 (평문)
     * @param verificationEmail 인증 이메일
     * @return 생성된 UserEntity
     */
    public UserEntity createAdmin(String loginId, String nickname, String password, String verificationEmail) {

        // 🔹 중복 체크
        if (userRepository.findByLoginId(loginId).isPresent()) {
            throw new RuntimeException("이미 존재하는 로그인 ID입니다.");
        }

        if (userRepository.findByNickname(nickname).isPresent()) {
            throw new RuntimeException("이미 존재하는 닉네임입니다.");
        }

        if (userRepository.findByVerificationEmail(verificationEmail).isPresent()) {
            throw new RuntimeException("이미 존재하는 이메일입니다.");
        }

        UserEntity admin = UserEntity.builder()
                .loginId(loginId)
                .nickname(nickname)
                .password(passwordEncoder.encode(password))
                .verificationEmail(verificationEmail)
                .role(UserEntity.Role.ADMIN)
                .build();

        return userRepository.save(admin);
    }
}