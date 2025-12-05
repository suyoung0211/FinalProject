package org.usyj.makgora.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secretKey;

    // -------------------------------------------------------------
    // ⭐ 토큰 만료 시간
    // -------------------------------------------------------------
    private final long accessTokenExpire = 1000L * 60 * 60;              // 15분( 일단 1시간 )
    private final long refreshTokenExpire = 1000L * 60 * 60 * 24 * 14;   // 14일

    /** SecretKey를 Key 객체로 변환 */
    private Key getSigningKey() {
        byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // -------------------------------------------------------------
    // ⭐ 액세스 토큰 생성
    // 사용자 ID / Role / Nickname 포함
    // -------------------------------------------------------------
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

    // -------------------------------------------------------------
    // ⭐ 리프레시 토큰 생성
    // 사용자 ID만 포함 → DB에서 필요한 정보 다시 조회 가능
    // -------------------------------------------------------------
    public String createRefreshToken(Integer id) {
        Claims claims = Jwts.claims();
        claims.put("id", id);

        Date now = new Date();
        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + refreshTokenExpire))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // -------------------------------------------------------------
    // ⭐ 토큰 유효성 검사
    // 성공하면 true, 실패하면 false
    // -------------------------------------------------------------
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
    // ⭐ 토큰 정보 추출
    // Integer/Long 타입 오류 대비
    // -------------------------------------------------------------
    public Integer getUserId(String token) {
        Object id = getClaims(token).get("id");
        if (id instanceof Integer) return (Integer) id;
        if (id instanceof Long) return ((Long) id).intValue();
        return null;
    }

    public String getRole(String token) {
        return (String) getClaims(token).get("role");
    }

    public String getNickname(String token) {
        return (String) getClaims(token).get("nickname");
    }

    /** Claims 공통 처리 */
    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}