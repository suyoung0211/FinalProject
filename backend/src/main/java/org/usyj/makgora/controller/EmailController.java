package org.usyj.makgora.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.request.auth.EmailSendRequest;
import org.usyj.makgora.request.auth.EmailVerifyRequest;
import org.usyj.makgora.service.EmailService;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/email")
@RequiredArgsConstructor
@Slf4j
public class EmailController {

    private final EmailService emailService;

    /** 1) 인증코드 발송 */
    @PostMapping("/send")
    public ResponseEntity<?> send(@RequestBody EmailSendRequest req) {

        String email = req.getEmail();

        String code = emailService.createCode();
        LocalDateTime expires = emailService.expires();

        emailService.save(email, code, expires);

        // 🔥 비동기 전송 (응답 즉시 반환됨)
        emailService.sendMailAsync(email, code);

        return ResponseEntity.ok("인증코드 발송 처리됨");
    }

    /** 2) 인증코드 검증 */
    @PostMapping("/verify")
    public ResponseEntity<?> verify(@RequestBody EmailVerifyRequest req) {

        boolean ok = emailService.verifyCode(req.getEmail(), req.getCode());

        if (!ok) return ResponseEntity.badRequest().body("인증 실패");

        emailService.markVerified(req.getEmail());

        return ResponseEntity.ok("인증 성공");
    }
}