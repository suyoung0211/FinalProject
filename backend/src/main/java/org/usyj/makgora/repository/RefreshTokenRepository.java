package org.usyj.makgora.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.usyj.makgora.entity.RefreshTokenEntity;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshTokenEntity, Long> {
  Optional<RefreshTokenEntity> findByUserId(Integer userId);

  Optional<RefreshTokenEntity> findByToken(String token);

  void deleteByUserId(Integer userId);

  void deleteByToken(String token); // ✅추가 : id가 아닌 토큰으로 삭제
}
