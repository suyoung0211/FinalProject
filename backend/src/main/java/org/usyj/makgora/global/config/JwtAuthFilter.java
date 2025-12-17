package org.usyj.makgora.global.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.RequiredArgsConstructor;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.filter.OncePerRequestFilter;
import org.usyj.makgora.global.security.JwtTokenProvider;
import org.usyj.makgora.service.CustomUserDetailsService;

import java.io.IOException;

@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService userDetailsService;

    /**
     * ============================================================
     * 🔥 Access Token 인증이 필요 없는 요청
     *
     * ✔ Refresh Token API는 절대 Access Token 검사하지 않는다
     * ✔ Refresh Token 쿠키 훼손 방지
     * ============================================================
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        return
            path.equals("/api/auth/login") ||
            path.equals("/api/auth/register") ||
            path.equals("/api/auth/refresh") || // ⭐ 중요

            path.startsWith("/api/email") ||
            path.startsWith("/api/home") ||

            (method.equals("GET") && path.startsWith("/api/issues")) ||
            (method.equals("GET") && path.startsWith("/api/rankings")) ||
            (method.equals("GET") && path.startsWith("/api/categories")) ||
            (method.equals("GET") && path.startsWith("/api/community/posts")) ||

            (method.equals("POST") && path.equals("/api/votes/ai-create")) ||

            (method.equals("GET")
                && path.matches("^/api/normal-votes(/.*)?$")
                && !path.matches("^.*/participate$"));
    }

    /**
     * ============================================================
     * 🔐 Access Token 인증 필터
     *
     * ✔ Access Token만 처리
     * ✔ Refresh Token / jti / DB 조회 ❌
     * ============================================================
     */
    @Override
    protected void doFilterInternal(
            HttpServletRequest req,
            HttpServletResponse res,
            FilterChain chain
    ) throws IOException, ServletException {

        String token = extractAccessToken(req);

        if (token != null) {
            try {
                // 🔹 Access Token은 "서명 + 만료"만 검증
                if (!jwtTokenProvider.validateToken(token)) {
                    throw new RuntimeException("Invalid or Expired Access Token");
                }

                Integer userId = jwtTokenProvider.getUserId(token);
                UserDetails userDetails =
                        userDetailsService.loadUserById(userId);

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                SecurityContextHolder.getContext()
                        .setAuthentication(authentication);

            } catch (Exception e) {
                res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                res.setContentType("text/plain;charset=UTF-8");
                res.getWriter().write("Access Token Invalid or Expired");
                return;
            }
        }

        chain.doFilter(req, res);
    }

    /**
     * Access Token 추출 유틸
     */
    private String extractAccessToken(HttpServletRequest req) {

        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }

        if (req.getCookies() != null) {
            for (Cookie c : req.getCookies()) {
                if ("accessToken".equals(c.getName())) {
                    return c.getValue();
                }
            }
        }

        return null;
    }
}
