package org.usyj.makgora.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.dto.request.EmailVerificationRequest;
import org.usyj.makgora.dto.response.EmailVerificationResponse;
import org.usyj.makgora.entity.UserEntity;
import org.usyj.makgora.repository.UserRepository;
import org.usyj.makgora.service.EmailService;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/email")
@RequiredArgsConstructor
@Slf4j
public class EmailController {

    private final EmailService emailService;
    private final UserRepository userRepository;

    /**
     * 1) 인증번호 발송
     */
    @PostMapping("/send")
    public ResponseEntity<?> sendVerificationCode(@RequestParam String email) {

        Optional<UserEntity> optionalUser = userRepository.findByEmail(email);

        if (optionalUser.isEmpty()) {
            return ResponseEntity.badRequest().body("존재하지 않는 이메일입니다.");
        }

        UserEntity user = optionalUser.get();

        // 이미 인증된 이메일이면 중단
        if (user.getEmailVerified()) {
            return ResponseEntity.badRequest().body("이미 인증된 이메일입니다.");
        }

        // 인증코드 + 만료시간 생성
        String code = emailService.generateVerificationCode();
        LocalDateTime expires = emailService.createExpireTime();

        // 유저에 저장
        user.setEmailVerificationToken(code);
        user.setEmailTokenExpires(expires);
        userRepository.save(user);

        // 이메일 발송
        boolean sent = emailService.sendVerificationEmail(email, code);

        if (!sent) {
            return ResponseEntity.internalServerError().body("이메일 발송 실패");
        }

        return ResponseEntity.ok("인증번호가 전송되었습니다.");
    }

    /**
     * 2) 인증번호 검증
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyEmail(@RequestBody EmailVerificationRequest req) {

        Optional<UserEntity> optionalUser =
                userRepository.findByEmailVerificationToken(req.getToken());

        if (optionalUser.isEmpty()) {
            return ResponseEntity.badRequest().body("잘못된 인증번호입니다.");
        }

        UserEntity user = optionalUser.get();

        // 만료 확인
        if (emailService.isTokenExpired(user.getEmailTokenExpires())) {
            return ResponseEntity.badRequest().body("만료된 인증번호입니다.");
        }

        // 이메일 인증 완료
        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailTokenExpires(null);
        userRepository.save(user);

        return ResponseEntity.ok(
                new EmailVerificationResponse(true, "이메일 인증 완료", user.getEmail())
        );
    }

    /**
     * 3) 인증 상태 확인
     */
    @GetMapping("/status")
    public ResponseEntity<?> checkStatus(@RequestParam String email) {

        Optional<UserEntity> optionalUser = userRepository.findByEmail(email);

        if (optionalUser.isEmpty()) {
            return ResponseEntity.badRequest().body("없는 이메일입니다.");
        }

        boolean verified = optionalUser.get().getEmailVerified();

        return ResponseEntity.ok(
                new EmailVerificationResponse(verified,
                        verified ? "인증됨" : "미인증 상태",
                        email)
        );
    }

    /**
 * 4) 인증번호 재전송
 */
@PostMapping("/resend")
public ResponseEntity<?> resendVerificationCode(@RequestParam String email) {

    Optional<UserEntity> optionalUser = userRepository.findByEmail(email);

    if (optionalUser.isEmpty()) {
        return ResponseEntity.badRequest().body("존재하지 않는 이메일입니다.");
    }

    UserEntity user = optionalUser.get();

    // 이미 인증된 이메일이면 재발송할 필요 없음
    if (user.getEmailVerified()) {
        return ResponseEntity.badRequest().body("이미 인증된 이메일입니다.");
    }

    // 새 인증코드 생성
    String newCode = emailService.generateVerificationCode();
    LocalDateTime expires = emailService.createExpireTime();

    // DB 업데이트
    user.setEmailVerificationToken(newCode);
    user.setEmailTokenExpires(expires);
    userRepository.save(user);

    // 이메일 발송
    boolean sent = emailService.sendVerificationEmail(email, newCode);
    if (!sent) {
        return ResponseEntity.internalServerError().body("이메일 발송 실패");
    }

    return ResponseEntity.ok("새 인증번호가 이메일로 재발송되었습니다.");
}
}
