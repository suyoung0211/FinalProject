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

    private final long accessTokenExpire = 1000L * 60 * 30;        // 30분
    private final long refreshTokenExpire = 1000L * 60 * 60 * 24 * 14; // 14일

    /** SecretKey를 Key 객체로 변환 */
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    /** Access Token 생성 */
    public String createAccessToken(Integer id, String email, String role) {
        return createToken(id, email, role, accessTokenExpire);
    }

    /** Refresh Token 생성 */
    public String createRefreshToken(Integer id, String email, String role) {
        return createToken(id, email, role, refreshTokenExpire);
    }

    /** 공통 Token 생성 */
    private String createToken(Integer id, String email, String role, long expire) {
        Claims claims = Jwts.claims().setSubject(email);
        claims.put("id", id);
        claims.put("role", role);

        Date now = new Date();

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + expire))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /** Token 검증 */
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
        return false; // ✅ 만료된 토큰은 false 반환
                      /* getUserId(), getEmail() 등도 실패
                         Access Token 사용할 수 없음
                      */
    }

    /** Token → User Email 추출 */
    public String getEmail(String token) {
        return getClaims(token).getSubject();
    }

    /** Token → User ID 추출 */
    public Integer getUserId(String token) {
        return (Integer) getClaims(token).get("id");
    }

    /** Token → User Role 추출 */
    public String getRole(String token) {
        return (String) getClaims(token).get("role");
    }

    /** Claims 파싱 공통 처리 */
    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
