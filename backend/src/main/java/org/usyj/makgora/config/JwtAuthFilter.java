package org.usyj.makgora.config;

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

import org.usyj.makgora.security.JwtTokenProvider;
import org.usyj.makgora.service.CustomUserDetailsService;

import java.io.IOException;

@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService userDetailsService;

    /**
     * ============================================================
     * 🔥 이 필터를 "아예 적용하지 않을 요청" 정의
     * ============================================================
     *
     * ✔ shouldNotFilter가 true를 반환하면
     *   → doFilterInternal 자체가 실행되지 않음
     *
     * ✔ refresh API에서
     *   - accessToken 추출 ❌
     *   - validateToken ❌
     *   - 401 응답 생성 ❌
     *
     * 👉 refreshToken 쿠키가 삭제될 가능성 원천 차단
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        return
            path.equals("/api/auth/login") ||
            path.equals("/api/auth/register") ||
            path.equals("/api/auth/refresh") ||

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
     * 🔐 보호된 API에서만 실행되는 JWT 인증 필터
     * ============================================================
     *
     * ✔ Access Token이 존재하면 검증
     * ✔ 유효하면 SecurityContext에 인증 정보 저장
     * ✔ 만료 / 위조 시 즉시 401 반환
     */
    @Override
    protected void doFilterInternal(
            HttpServletRequest req,
            HttpServletResponse res,
            FilterChain chain
    ) throws IOException, ServletException {

        // --------------------------------------------------
        // 🔹 Access Token 추출 (Header 우선, Cookie 보조)
        // --------------------------------------------------
        String token = null;

        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            // Authorization: Bearer xxx
            token = header.substring(7);
        } else if (req.getCookies() != null) {
            // 일부 환경에서 accessToken을 쿠키로 보낼 경우 대비
            for (Cookie c : req.getCookies()) {
                if ("accessToken".equals(c.getName())) {
                    token = c.getValue();
                    break;
                }
            }
        }

        // --------------------------------------------------
        // 🔹 Access Token이 있는 경우에만 인증 처리
        // --------------------------------------------------
        if (token != null) {
            try {
                // 1️⃣ 토큰 유효성 검증 (만료 / 서명 검증)
                if (!jwtTokenProvider.validateToken(token)) {
                    throw new RuntimeException("Invalid or Expired Token");
                }

                // 2️⃣ 토큰에서 사용자 식별자 추출
                Integer userId = jwtTokenProvider.getUserId(token);

                // 3️⃣ 사용자 정보 조회 (권한 포함)
                UserDetails userDetails = userDetailsService.loadUserById(userId);

                // 4️⃣ Spring Security 인증 객체 생성
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null, // JWT 기반이므로 credentials는 사용하지 않음
                                userDetails.getAuthorities()
                        );

                // 5️⃣ SecurityContext에 인증 정보 저장
                SecurityContextHolder.getContext().setAuthentication(authentication);

            } catch (Exception e) {
                // ❌ Access Token 문제 → 보호 API 접근 차단
                res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                res.setContentType("text/plain;charset=UTF-8");
                res.getWriter().write("JWT Expired or Invalid");
                return; // 🔥 이후 필터 / 컨트롤러로 절대 넘어가지 않음
            }
        }

        // --------------------------------------------------
        // ⭕ 인증 성공 또는 토큰 없음 → 다음 필터 진행
        // --------------------------------------------------
        chain.doFilter(req, res);
    }
}
