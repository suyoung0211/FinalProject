package org.usyj.makgora.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.usyj.makgora.entity.UserEntity;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Integer> {

    // 이메일로 사용자 찾기
    Optional<UserEntity> findByEmail(String email);

    // 닉네임으로 사용자 찾기
    Optional<UserEntity> findByNickname(String nickname);

    // 활성 상태인 사용자만 찾기
    Optional<UserEntity> findByEmailAndStatus(String email, UserEntity.Status status);
    
}