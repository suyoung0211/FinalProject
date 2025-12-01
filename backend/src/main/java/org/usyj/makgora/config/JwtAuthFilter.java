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

    System.out.println("=== [JWT FILTER DEBUG] ========================");
    System.out.println("Request URI: " + path);
    System.out.println("Method     : " + method);
    System.out.println("Headers    : Authorization=" + req.getHeader("Authorization"));
    System.out.println("==============================================");

    boolean skip =
        path.equals("/api/auth/login") ||
        path.equals("/api/auth/register") ||
        path.equals("/api/auth/refresh") ||
        path.startsWith("/api/email") ||
        path.startsWith("/api/home") ||

        // ⭐ 기사 GET 허용 — 여기에서 진짜로 찍히는 path가 뭔지 확인 가능
        (method.equals("GET") && path.startsWith("/api/articles")) ||

        // ⭐ 이슈 GET
        (method.equals("GET") && path.startsWith("/api/issues")) ||

        // ⭐ 투표 GET (my 제외)
        (method.equals("GET") && path.startsWith("/api/votes") && !path.startsWith("/api/votes/my"));

    System.out.println("Skip? " + skip);

    if (skip) {
        System.out.println("→ SKIPPED JWT AUTH");
        chain.doFilter(req, res);
        return;
    }

    System.out.println("→ JWT AUTH CHECK START");

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

    System.out.println("Token Found? " + (token != null));

    if (token != null && jwtTokenProvider.validateToken(token)) {
        String email = jwtTokenProvider.getEmail(token);
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities())
        );
        System.out.println("JWT VALID → AUTH SUCCESS");
    } else {
        System.out.println("JWT INVALID OR NOT FOUND");
    }

    chain.doFilter(req, res);
}
}
