package org.usyj.makgora.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer id;

    @Column(nullable = false, unique = true, length = 150)
    private String loginId;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false, length = 50, unique = true)
    private String nickname;

    @Enumerated(EnumType.STRING)
    @Column(length = 10, nullable = false)
    @Builder.Default
    private Role role = Role.USER;

    @Builder.Default
    private Integer points = 5000;

    @Builder.Default
    private Integer level = 1;

    // ✅ 아바타 이미지는 상점과 별도로 유지 (원하면 그대로 사용)
    @Column(length = 255)
    private String avatarIcon;

    // ✅ 프로필 테두리 이미지 (상점 FRAME 아이템으로 적용)
    @Column(length = 255)
    private String profileFrame;

    // ✅ 프로필 뱃지 이미지 (상점 BADGE 아이템으로 적용)
    @Column(length = 255)
    private String profileBadge;

    @Column(length = 150, unique = true)
    private String verificationEmail;

    @Enumerated(EnumType.STRING)
    @Column(length = 30, nullable = false)
    @Builder.Default
    private Status status = Status.ACTIVE;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(length = 500)
    private String refreshToken;

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum Role {
        USER,
        ADMIN,
        SUPER_ADMIN
    }

    public enum Status {
        ACTIVE,
        INACTIVE,
        DELETED
    }
}
