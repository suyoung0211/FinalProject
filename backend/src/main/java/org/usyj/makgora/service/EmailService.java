package org.usyj.makgora.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /** 6자리 인증번호 생성 */
    public String generateVerificationCode() {
        return String.format("%06d", (int)(Math.random() * 1000000));
    }

    /** 5분 만료시간 생성 */
    public LocalDateTime createExpireTime() {
        return LocalDateTime.now().plusMinutes(5);
    }

    /** 이메일 발송 */
    public boolean sendVerificationEmail(String email, String code) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject("이메일 인증번호입니다");

            String html = """
                    <h2>이메일 인증번호</h2>
                    <p>아래 인증번호를 입력해주세요:</p>
                    <h1>%s</h1>
                    <p>인증번호는 5분 후 만료됩니다.</p>
                    """.formatted(code);

            helper.setText(html, true);

            mailSender.send(message);

            log.info("인증 이메일 발송 완료: {} / code={}", email, code);
            return true;

        } catch (Exception e) {
            log.error("이메일 발송 실패: {}", e.getMessage());
            return false;
        }
    }

    /** 인증번호 만료 여부 확인 */
    public boolean isTokenExpired(LocalDateTime expires) {
        return expires == null || LocalDateTime.now().isAfter(expires);
    }
}
