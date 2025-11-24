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
        System.out.println("🔎 요청 URL : " + path);

        // 🔹 JWT 검사를 생략할 URL만 명확히 지정
        boolean skip =
                path.equals("/api/auth/login") ||
                path.equals("/api/auth/register") ||
                path.equals("/api/auth/refresh") ||
                path.startsWith("/api/email");

        if (skip) {
            System.out.println("➡ JWT 검사 생략 URL → " + path);
            chain.doFilter(req, res);
            return;
        }

        // 🔹 그 외 모든 API는 JWT 검사
        String header = req.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);

            if (jwtTokenProvider.validate(token)) {

                String email = jwtTokenProvider.getEmail(token);
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities()
                        );

                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }

        chain.doFilter(req, res);
    }
}
