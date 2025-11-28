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
    private Integer points = 0;

    @Builder.Default
    private Integer level = 1;

    @Column(length = 255)
    private String profileImage;

    @Column(length = 255)
    private String profileBackground;

    @Column(length = 150, unique = true)
    private String verificationEmail;

    @Enumerated(EnumType.STRING)
    @Column(length = 10, nullable = false)
    @Builder.Default
    private Status status = Status.ACTIVE;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    // 🔹 로그인/재발급에 사용하는 refreshToken
    @Column(length = 500)
    private String refreshToken;

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum Role {
        SUPER_ADMIN,
        USER,
        ADMIN
    }

    public enum Status {
        ACTIVE,
        INACTIVE,
        DELETED
    }
}
