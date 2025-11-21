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
        System.out.println("\n==============================");
        System.out.println("🔎 [JwtAuthFilter] 요청 URL : " + path);

        // ---------------------------------------------------------------------
        // ⭐ 1) 인증 필요 없는 URL은 필터 제외
        // ---------------------------------------------------------------------
        if (path.startsWith("/api/auth")) {
            System.out.println("➡ 인증 필요 없는 경로 → JWT 검사 생략");
            chain.doFilter(req, res);
            return;
        }

        // ---------------------------------------------------------------------
        // ⭐ 2) Authorization 헤더 추출
        // ---------------------------------------------------------------------
        String header = req.getHeader("Authorization");

        if (header == null) {
            System.out.println("⚠ Authorization 헤더 없음 → 인증하지 않고 통과");
        }
        else if (!header.startsWith("Bearer ")) {
            System.out.println("⚠ 잘못된 Authorization 형식: " + header);
        }
        else {
            String token = header.substring(7);
            System.out.println("📌 JWT 추출됨: " + token);

            // -----------------------------------------------------------------
            // ⭐ 3) JWT 검증
            // -----------------------------------------------------------------
            if (jwtTokenProvider.validate(token)) {
                System.out.println("✅ JWT 검증 성공");

                String email = jwtTokenProvider.getEmail(token);
                System.out.println("📧 JWT Email: " + email);

                UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                System.out.println("👤 UserDetails 로드 성공");

                // SecurityContext에 인증 정보 저장
                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());

                SecurityContextHolder.getContext().setAuthentication(auth);
                System.out.println("🔐 SecurityContext 인증 세팅 완료");
            }
            else {
                System.out.println("❌ JWT 검증 실패 → 인증 불가");
            }
        }

        // ---------------------------------------------------------------------
        // ⭐ 4) 다음 필터로 진행
        // ---------------------------------------------------------------------
        chain.doFilter(req, res);
        System.out.println("==============================\n");
    }
}
