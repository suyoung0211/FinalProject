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

        // ======================================================
        // 🔥 인증을 완전히 skip하는 PUBLIC API (원래 규칙 유지)
        // ======================================================
        boolean skip =
                path.equals("/api/auth/login") ||
                path.equals("/api/auth/register") ||
                path.equals("/api/auth/refresh") ||
                path.startsWith("/api/email") ||
                path.startsWith("/api/home") ||
                (method.equals("GET") && path.startsWith("/api/issues/")) ||
                (method.equals("GET") && path.startsWith("/api/rankings/")) ||
                (method.equals("GET") && path.startsWith("/api/categories")) ||
                (method.equals("GET") && path.startsWith("/api/issues")) ||

                // 리스트는 public
                (method.equals("GET") && path.equals("/api/votes")) ||
                (method.equals("GET") && path.equals("/api/votes/")) ||

                // 🔥 여기서 /api/votes/{id}/detail 은 skip에서 제외해야 함
                // 그래서 path.startsWith("/api/votes/") 를 절대 넣으면 안 됨

                (method.equals("GET") && path.startsWith("/api/community/posts")) ||
                (method.equals("POST") && path.equals("/api/votes/ai-create")) ||
                (method.equals("GET") && path.matches("^/api/normal-votes(/.*)?$") && !path.matches("^.*/participate$"));

        // ⭐⭐ skip에 해당하면 인증 없이 바로 진행
        if (skip) {
            chain.doFilter(req, res);
            return;
        }

        // ======================================================
        // 🔥 JWT 추출 (Header 또는 Cookie)
        // ======================================================
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

        // ======================================================
        // 🔥 Optional 인증 (token 없어도 통과)
        // ======================================================
        if (token != null && !token.isBlank()) {
            try {
                if (jwtTokenProvider.validateToken(token)) {

                    Integer userId = jwtTokenProvider.getUserId(token);
                    UserDetails userDetails = userDetailsService.loadUserById(userId);

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities()
                            );

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (Exception e) {
                // ⭐ token 오류는 detail에서 끊으면 안 됨
                // 그냥 인증 없이 진행
            }
        }

        // ======================================================
        // 🔥 필터 체인 계속 진행
        // ======================================================
        chain.doFilter(req, res);
    }
}
