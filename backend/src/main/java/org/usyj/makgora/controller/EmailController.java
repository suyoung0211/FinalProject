package org.usyj.makgora.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.dto.request.EmailSendRequest;
import org.usyj.makgora.dto.request.EmailVerifyRequest;
import org.usyj.makgora.service.EmailService;
import org.usyj.makgora.service.EmailVerificationStore;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/email")
@RequiredArgsConstructor
@Slf4j
public class EmailController {

    private final EmailService emailService;
    private final EmailVerificationStore store;

    // 1) 인증코드 보내기
    @PostMapping("/send")
    public ResponseEntity<?> send(@RequestBody EmailSendRequest req) {

        String email = req.getEmail();

        String code = emailService.createCode();
        LocalDateTime expires = emailService.expires();

        store.save(email, code, expires);

        boolean ok = emailService.sendMail(email, code);
        if (!ok) return ResponseEntity.internalServerError().body("메일 발송 실패");

        return ResponseEntity.ok("인증코드 발송 완료");
    }


    // 2) 인증코드 검증
    @PostMapping("/verify")
    public ResponseEntity<?> verify(@RequestBody EmailVerifyRequest req) {

        var data = store.get(req.getEmail());
        if (data == null) {
            return ResponseEntity.badRequest().body("인증 요청 없음");
        }

        if (data.getExpiresAt().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("코드 만료");
        }

        if (!data.getCode().equals(req.getCode())) {
            return ResponseEntity.badRequest().body("코드 불일치");
        }

        // 인증 성공하면 메모리에서 삭제
        store.remove(req.getEmail());

        return ResponseEntity.ok("인증 성공");
    }
}
