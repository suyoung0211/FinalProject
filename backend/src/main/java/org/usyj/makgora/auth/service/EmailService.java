package org.usyj.makgora.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.usyj.makgora.auth.entity.EmailVerificationEntity;
import org.usyj.makgora.auth.repository.EmailVerificationRepository;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final EmailVerificationRepository emailRepo;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder; // 🔥 추가

    /** 인증코드 생성 */
    public String createCode() {
        return String.format("%06d", (int) (Math.random() * 1000000));
    }

    /** 만료시간 */
    public LocalDateTime expires() {
        return LocalDateTime.now().plusMinutes(5);
    }

    /** 인증 요청 저장 (🔥 해시 저장) */
    public void save(String email, String code, LocalDateTime expires) {

        String hashed = passwordEncoder.encode(code); // 🔥 해시 변환

        emailRepo.save(
                EmailVerificationEntity.builder()
                        .email(email)
                        .code(hashed) // 🔥 평문 저장 X → 해시 저장
                        .expiresAt(expires)
                        .verified(false)
                        .build()
        );
    }

    /** 최신 인증 정보 조회 */
    public EmailVerificationEntity getLatest(String email) {
        return emailRepo.findTopByEmailOrderByCreatedAtDesc(email).orElse(null);
    }

    /** 인증 검증 (🔥 해시 비교) */
    public boolean verifyCode(String email, String inputCode) {

        EmailVerificationEntity entity = getLatest(email);
        if (entity == null) return false;

        if (entity.getExpiresAt().isBefore(LocalDateTime.now())) return false;

        // 🔥 입력된 코드와 해시된 코드 비교
        return passwordEncoder.matches(inputCode, entity.getCode());
    }

    /** verified = true 업데이트 */
    public void markVerified(String email) {

        EmailVerificationEntity entity =
                emailRepo.findTopByEmailOrderByCreatedAtDesc(email)
                        .orElseThrow(() -> new RuntimeException("인증 정보 없음"));

        entity.setVerified(true);
        emailRepo.save(entity);
    }

   /** ⭐ 비동기 이메일 발송 */
    @Async
    public void sendMailAsync(String email, String code) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("이메일 인증코드");
            message.setText("인증코드: " + code);

            System.out.println("📨 이메일 비동기 발송 시작...");
            mailSender.send(message);
            System.out.println("📨 이메일 발송 완료!");

        } catch (Exception e) {
            System.out.println("메일 발송 오류: " + e.getMessage());
        }
    }
}
