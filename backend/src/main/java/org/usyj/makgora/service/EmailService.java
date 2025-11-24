package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.usyj.makgora.entity.EmailVerificationEntity;
import org.usyj.makgora.repository.EmailVerificationRepository;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;

import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final EmailVerificationRepository emailRepo;
    private final JavaMailSender mailSender;

    /** 인증코드 생성 */
    public String createCode() {
        return String.format("%06d", (int)(Math.random()*1000000));
    }

    /** 만료시간 */
    public LocalDateTime expires() {
        return LocalDateTime.now().plusMinutes(5);
    }

    /** 인증 요청 저장 */
    public void save(String email, String code, LocalDateTime expires) {
        emailRepo.save(
            EmailVerificationEntity.builder()
                    .email(email)
                    .code(code)
                    .expiresAt(expires)
                    .verified(false)
                    .build()
        );
    }

    /** 인증 정보 조회 */
    public EmailVerificationEntity getLatest(String email) {
        return emailRepo.findTopByEmailOrderByCreatedAtDesc(email).orElse(null);
    }

    /** verified = true 업데이트 */
    public void markVerified(String email) {
        EmailVerificationEntity entity =
                emailRepo.findTopByEmailOrderByCreatedAtDesc(email)
                        .orElseThrow(() -> new RuntimeException("인증 정보 없음"));

        entity.setVerified(true);
        emailRepo.save(entity);
    }

    /** 인증코드 발송 */
    public boolean sendMail(String email, String code) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("이메일 인증코드");
            message.setText("인증코드: " + code);
            mailSender.send(message);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}