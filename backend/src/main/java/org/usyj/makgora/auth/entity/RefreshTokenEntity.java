package org.usyj.makgora.auth.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

import org.usyj.makgora.user.entity.UserEntity;

@Entity
@Table(
    name = "refresh_tokens",
    uniqueConstraints = {
        // 🔒 jti는 토큰 자체를 식별하는 값이므로 반드시 UNIQUE
        @UniqueConstraint(columnNames = "jti")
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
// ⚠️ Setter 남발 방지
// RefreshToken은 생성 후 거의 변경되지 않는 "세션 객체"
@AllArgsConstructor
@Builder
public class RefreshTokenEntity {

    // -------------------------------------------------------------
    // 🔑 PK
    // -------------------------------------------------------------
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // -------------------------------------------------------------
    // 🔗 어떤 유저의 Refresh Token인지
    // -------------------------------------------------------------
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    // -------------------------------------------------------------
    // ⭐ JWT ID (jti)
    // -------------------------------------------------------------
    // - Refresh Token 자체의 고유 식별자
    // - JWT 안에 들어가는 값
    // - DB에서 이 값으로 토큰 유효성 판단
    @Column(nullable = false, length = 36, unique = true)
    private String jti;

    // -------------------------------------------------------------
    // ⏰ 만료 시각
    // -------------------------------------------------------------
    // - JWT의 exp와 동일한 시각
    // - DB 레벨에서도 만료 판단 가능
    @Column(nullable = false)
    private LocalDateTime expiresAt;

    // -------------------------------------------------------------
    // 🕒 생성 시각
    // -------------------------------------------------------------
    // - 디버깅
    // - 관리용
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // -------------------------------------------------------------
    // 📌 생성 시 자동 설정
    // -------------------------------------------------------------
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // -------------------------------------------------------------
    // 🔍 만료 여부 판단 도메인 메서드
    // -------------------------------------------------------------
    // Service 단에서 if 문 남발하지 않기 위함
    public boolean isExpired() {
        return this.expiresAt.isBefore(LocalDateTime.now());
    }
}
