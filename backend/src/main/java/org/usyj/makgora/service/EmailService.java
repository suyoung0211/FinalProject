package org.usyj.makgora.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String from;

    public String createCode() {
        return String.valueOf((int)(Math.random() * 900000 + 100000)); // 6자리 숫자 코드
    }

    public LocalDateTime expires() {
        return LocalDateTime.now().plusMinutes(10);
    }

    public boolean sendMail(String to, String code) {
        try {
            String html = """
                <h2>이메일 인증</h2>
                <p>인증코드: <b>%s</b></p>
                <p>10분 내로 입력해주세요.</p>
            """.formatted(code);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject("회원가입 이메일 인증");
            helper.setText(html, true);

            mailSender.send(message);
            return true;

        } catch (Exception e) {
            log.error("메일 전송 오류: {}", e.getMessage());
            return false;
        }
    }
}
