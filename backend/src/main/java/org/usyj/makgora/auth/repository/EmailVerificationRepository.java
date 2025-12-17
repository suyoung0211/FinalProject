package org.usyj.makgora.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.usyj.makgora.auth.entity.EmailVerificationEntity;

import java.util.Optional;

public interface EmailVerificationRepository extends JpaRepository<EmailVerificationEntity, Long> {

    Optional<EmailVerificationEntity> findTopByEmailOrderByCreatedAtDesc(String email);

    void deleteByEmail(String email);
}
