package org.usyj.makgora.global.config;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;
import org.usyj.makgora.entity.UserEntity;
import org.usyj.makgora.entity.UserEntity.Role;
import org.usyj.makgora.entity.UserEntity.Status;
import org.usyj.makgora.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

@Component
public class SuperAdminInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public SuperAdminInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void createSuperAdmin() {
        // loginId가 "superadmin"인 계정이 없으면 생성
        if (!userRepository.existsByLoginId("superadmin")) {
            UserEntity superAdmin = UserEntity.builder()
                    .loginId("superadmin")
                    .password(passwordEncoder.encode("123")) // 초기 비밀번호
                    .nickname("최고관리자")
                    .role(Role.SUPER_ADMIN)
                    .status(Status.ACTIVE)
                    .points(99999)
                    .level(99999)
                    .verificationEmail("superadmin@superadmin.com")
                    .build();
            userRepository.save(superAdmin);
            System.out.println("✅ 슈퍼어드민 계정 생성 완료: superadmin / 123");
        } else {
            System.out.println("ℹ️ 슈퍼어드민 계정 이미 존재함");
        }
    }
}
