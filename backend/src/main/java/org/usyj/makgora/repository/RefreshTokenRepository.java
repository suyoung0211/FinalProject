package org.usyj.makgora.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.usyj.makgora.entity.RefreshTokenEntity;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshTokenEntity, Long> {

    // -------------------------------------------------------------
    // ⭐ jti 기준 조회
    // -------------------------------------------------------------
    // - Refresh Token 검증
    // - Access Token 재발급
    // - Rotation 처리
    Optional<RefreshTokenEntity> findByJti(String jti);

    // -------------------------------------------------------------
    // ⭐ jti 기준 삭제
    // -------------------------------------------------------------
    // - 로그아웃
    // - 탈취 감지 시 강제 만료
    void deleteByJti(String jti);

    // -------------------------------------------------------------
    // (선택) 특정 유저의 모든 Refresh Token 삭제
    // -------------------------------------------------------------
    // - 비밀번호 변경
    // - 전체 로그아웃
    void deleteAllByUser_Id(Integer userId);
}
