package org.usyj.makgora.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "email_verification")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailVerificationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String email;   // 인증 대상 이메일

    @Column(nullable = false, length = 100)
    private String code;    // 6자리 인증코드

    private LocalDateTime expiresAt;

    @Builder.Default
    private Boolean verified = false;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
