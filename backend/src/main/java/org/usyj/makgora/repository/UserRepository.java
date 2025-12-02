package org.usyj.makgora.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.usyj.makgora.entity.UserEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Integer> {

    // ID로 사용자 찾기
    Optional<UserEntity> findByLoginId(String loginId);

    // 닉네임으로 사용자 찾기
    Optional<UserEntity> findByNickname(String nickname);

    // 활성 상태인 사용자만 찾기
    Optional<UserEntity> findByLoginIdAndStatus(String loginId, UserEntity.Status status);
    
    // 🔹 nickname 일부 포함 검색
    List<UserEntity> findByNicknameContaining(String nickname);

    // 🔹 로그인 아이디 존재 여부 확인
    boolean existsByLoginId(String loginId);

    // 인증 이메일로 사용자 찾기
    Optional<UserEntity> findByVerificationEmail(String verificationEmail);

    // 인증 이메일 존재 여부 확인
    boolean existsByVerificationEmail(String verificationEmail);
}