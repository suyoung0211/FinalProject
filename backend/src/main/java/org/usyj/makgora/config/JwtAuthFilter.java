package org.usyj.makgora.config;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
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

    @Override
    protected void doFilterInternal(
            HttpServletRequest req,
            HttpServletResponse res,
            FilterChain chain
    ) throws IOException, ServletException {

        String path = req.getRequestURI();
        String method = req.getMethod();

        // -----------------------------
        // 🔥 인증을 건너뛸 API 정의
        // -----------------------------
        boolean skip =
                path.equals("/api/auth/login") ||
                path.equals("/api/auth/register") ||
                path.equals("/api/auth/refresh") ||
                path.startsWith("/api/email") ||
                path.startsWith("/api/home") ||
                (method.equals("GET") && path.startsWith("/api/issues/")) ||
                (method.equals("GET") && path.startsWith("/api/rankings/")) ||
                (method.equals("GET") && path.startsWith("/api/articles")) ||
                (method.equals("GET") && path.startsWith("/api/categories")) ||
                (method.equals("GET") && path.startsWith("/api/issues")) ||
                (method.equals("GET") &&
                        (path.equals("/api/votes")
                                || path.equals("/api/votes/")
                                || (path.startsWith("/api/votes/") && !path.startsWith("/api/votes/my"))
                        )
                ) ||
                (method.equals("GET") && path.startsWith("/api/community/posts"))||
                (method.equals("GET") && path.startsWith("/api/normal-votes"));

        if (skip) {
            chain.doFilter(req, res);
            return;
        }

        // -----------------------------
        // 🔥 JWT 추출 (Header 또는 Cookie)
        // -----------------------------
        String token = null;
        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            token = header.substring(7);
        } else if (req.getCookies() != null) {
            for (Cookie c : req.getCookies()) {
                if ("accessToken".equals(c.getName())) {
                    token = c.getValue();
                    break;
                }
            }
        }

        // -----------------------------
        // 🔥 JWT 검증 후 SecurityContext 설정
        // -----------------------------
        if (token != null && jwtTokenProvider.validateToken(token)) {
            // 액세스 토큰에서 유저 ID만 꺼내서 UserDetails 조회
            Integer userId = jwtTokenProvider.getUserId(token);

            // 유저 ID 기반 UserDetails 조회
            UserDetails userDetails = userDetailsService.loadUserById(userId);

            // Authentication 객체 생성 후 SecurityContext에 등록
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities()
                    );

            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        chain.doFilter(req, res);
    }
}