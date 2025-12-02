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
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        String path = req.getRequestURI();
        String method = req.getMethod();

        // Vote GET은 공개 BUT my 조회는 제외
        boolean isPublicVoteGet =
                method.equals("GET")
                && path.startsWith("/api/votes/")
                && !path.startsWith("/api/votes/my");

        // JWT 검사를 생략할 경로들
        boolean skip =
                path.equals("/api/auth/login") ||
                path.equals("/api/auth/register") ||
                path.equals("/api/auth/refresh") ||
                path.startsWith("/api/email") ||
                path.startsWith("/api/home") ||
                (method.equals("GET") && path.startsWith("/api/issues/")) ||
                (method.equals("GET") && path.startsWith("/api/rankings/")) ||
                isPublicVoteGet;

        if (skip) {
            chain.doFilter(req, res);
            return;
        }

        // Access Token 추출
        String token = null;

        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            token = header.substring(7);
        }

        if (token == null && req.getCookies() != null) {
            for (Cookie c : req.getCookies()) {
                if ("accessToken".equals(c.getName())) {
                    token = c.getValue();
                    break;
                }
            }
        }

        // JWT 유효성 검사
        if (token != null && jwtTokenProvider.validateToken(token)) {
            String email = jwtTokenProvider.getEmail(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities()
                    );

            SecurityContextHolder.getContext().setAuthentication(auth);
        }

        chain.doFilter(req, res);
    }
}
