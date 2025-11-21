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

    // ⭐ key 변환 (HS256 요구 조건 충족)
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    public String createAccessToken(Integer id, String email, String role) {
        return createToken(id, email, role, accessTokenExpire);
    }

    public String createRefreshToken(Integer id, String email, String role) {
        return createToken(id, email, role, refreshTokenExpire);
    }

    private String createToken(Integer id, String email, String role, long expire) {
        Claims claims = Jwts.claims().setSubject(email);
        claims.put("id", id);
        claims.put("role", role);

        Date now = new Date();

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + expire))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)   // ⭐ FIXED
                .compact();
    }

    public boolean validate(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())   // ⭐ FIXED
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String getEmail(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())      // ⭐ FIXED
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
}
