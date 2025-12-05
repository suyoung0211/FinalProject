package org.usyj.makgora.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secretKey;

    // -----------------------------
    // 실무에서 많이 쓰이는 만료 시간
    // -----------------------------
    private final long accessTokenExpire = 1000L * 60 * 15;        // 15분
    private final long refreshTokenExpire = 1000L * 60 * 60 * 24 * 14; // 14일

    /** SecretKey를 Key 객체로 변환 */
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    // -----------------------------
    // 액세스 토큰 생성
    // -----------------------------
    // 담을 정보: id, role, nickname
    public String createAccessToken(Integer id, String role, String nickname) {
        Claims claims = Jwts.claims();
        claims.put("id", id);
        claims.put("role", role);
        claims.put("nickname", nickname); // 전역에서 바로 꺼내 쓸 수 있음

        Date now = new Date();
        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + accessTokenExpire))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // -----------------------------
    // 리프레시 토큰 생성
    // -----------------------------
    // 담을 정보: id만
    public String createRefreshToken(Integer id) {
        Claims claims = Jwts.claims();
        claims.put("id", id); // 액세스 토큰 재발급 시 DB 조회 후 role, nickname 추가

        Date now = new Date();
        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + refreshTokenExpire))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // -----------------------------
    // 토큰 검증
    // -----------------------------
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            System.out.println("JWT 만료됨");
        } catch (UnsupportedJwtException e) {
            System.out.println("지원되지 않는 JWT");
        } catch (MalformedJwtException e) {
            System.out.println("Invalid JWT");
        } catch (SignatureException e) {
            System.out.println("잘못된 JWT 서명");
        } catch (IllegalArgumentException e) {
            System.out.println("JWT empty");
        }
        return false; // 만료되거나 잘못된 토큰은 false 반환
    }

    // -----------------------------
    // 토큰에서 정보 추출
    // -----------------------------
    public Integer getUserId(String token) {
        return (Integer) getClaims(token).get("id");
    }

    public String getRole(String token) {
        return (String) getClaims(token).get("role");
    }

    public String getNickname(String token) {
        return (String) getClaims(token).get("nickname");
    }

    // -----------------------------
    // Claims 파싱 공통 처리
    // -----------------------------
    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}