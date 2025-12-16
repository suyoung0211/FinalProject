package org.usyj.makgora.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secretKey;

    // -------------------------------------------------------------
    // ⭐ 토큰 만료 시간
    // -------------------------------------------------------------
    private final long accessTokenExpire = 1000L * 60 * 60;            // 1시간
    private final long refreshTokenExpire = 1000L * 60 * 60 * 24 * 14; // 14일

    // -------------------------------------------------------------
    // ⭐ SecretKey를 Key 객체로 변환
    // -------------------------------------------------------------
    private Key getSigningKey() {
        byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // =============================================================
    // 🔐 Access Token
    // =============================================================
    public String createAccessToken(Integer id, String role, String nickname) {

        Claims claims = Jwts.claims();
        claims.put("id", id);
        claims.put("role", role);
        claims.put("nickname", nickname);

        Date now = new Date();

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + accessTokenExpire))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // =============================================================
    // 🔁 Refresh Token
    // =============================================================

    /**
     * Refresh Token 생성 결과를 담는 DTO
     * - JWT 문자열
     * - jti
     * - 만료 시각
     *
     * 👉 AuthService에서 DB 저장용으로 사용
     */
    @Getter
    public static class RefreshTokenResult {
        private final String token;
        private final String jti;
        private final LocalDateTime expiresAt;

        public RefreshTokenResult(String token, String jti, LocalDateTime expiresAt) {
            this.token = token;
            this.jti = jti;
            this.expiresAt = expiresAt;
        }
    }

    /**
     * Refresh Token 생성
     * - jti 생성
     * - JWT에 포함
     * - DB 저장에 필요한 정보 함께 반환
     */
    public RefreshTokenResult createRefreshToken(Integer userId) {

        // 🔹 Refresh Token 고유 식별자
        String jti = UUID.randomUUID().toString();

        Claims claims = Jwts.claims();
        claims.put("id", userId);
        claims.put("jti", jti);

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refreshTokenExpire);

        String token = Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();

        // 🔹 DB에 저장할 만료 시각
        LocalDateTime expiresAt =
                LocalDateTime.now().plusSeconds(refreshTokenExpire / 1000);

        return new RefreshTokenResult(token, jti, expiresAt);
    }

    // =============================================================
    // 🔍 Token Validation / Parsing
    // =============================================================

    /**
     * JWT 기본 유효성 검사
     * - 서명
     * - 만료
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;

        } catch (ExpiredJwtException e) {
            System.out.println("JWT 만료됨");
        } catch (JwtException | IllegalArgumentException e) {
            System.out.println("JWT 유효성 실패: " + e.getMessage());
        }
        return false;
    }

    // -------------------------------------------------------------
    // ⭐ Claims 추출
    // -------------------------------------------------------------
    public Integer getUserId(String token) {
        Object id = getClaims(token).get("id");
        if (id instanceof Integer) return (Integer) id;
        if (id instanceof Long) return ((Long) id).intValue();
        return null;
    }

    public String getJti(String token) {
        return (String) getClaims(token).get("jti");
    }

    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
