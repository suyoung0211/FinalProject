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

        System.out.println("=== [JWT FILTER DEBUG] ========================");
        System.out.println("Request URI : " + path);
        System.out.println("HTTP Method : " + method);
        System.out.println("Header Authorization : " + req.getHeader("Authorization"));
        System.out.println("Cookies : " + (req.getCookies() != null ? req.getCookies().length : 0));
        System.out.println("=================================================");

        // 🔥 인증을 건너뛸 API 정의
        boolean skip =
                path.equals("/api/auth/login") ||
                path.equals("/api/auth/register") ||
                path.equals("/api/auth/refresh") ||
                path.startsWith("/api/email") ||
                path.startsWith("/api/home") ||

                // 기사 GET
                (method.equals("GET") && path.startsWith("/api/articles")) ||
                // 🔥 기사 카테고리 GET 추가
                (method.equals("GET") && path.startsWith("/api/categories")) ||

                // 이슈 GET
                (method.equals("GET") && path.startsWith("/api/issues")) ||

                // 🔥 투표 GET (my만 제외)
                (method.equals("GET") &&
                        (path.equals("/api/votes")
                                || path.equals("/api/votes/")
                                || (path.startsWith("/api/votes/") && !path.startsWith("/api/votes/my"))
                        )
                ) ||

                // 커뮤니티 GET
                (method.equals("GET") && path.startsWith("/api/community/posts"));

        System.out.println("Skip JWT Authentication? → " + skip);

        // 🔥 스킵이면 그냥 다음 필터
        if (skip) {
            System.out.println("→ SKIPPED: JWT AUTH FILTER\n");
            chain.doFilter(req, res);
            return;
        }

        System.out.println("→ JWT AUTH CHECK START");

        // --------------------------
        // 🔥 JWT 토큰 추출
        // --------------------------
        String token = null;

        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            token = header.substring(7);
            System.out.println("Token found in Header");
        }

        if (token == null && req.getCookies() != null) {
            for (Cookie c : req.getCookies()) {
                if ("accessToken".equals(c.getName())) {
                    token = c.getValue();
                    System.out.println("Token found in Cookie");
                    break;
                }
            }
        }

        System.out.println("Token Detected? → " + (token != null));

        // --------------------------
        // 🔥 JWT 토큰 검증
        // --------------------------
        if (token != null && jwtTokenProvider.validateToken(token)) {
            System.out.println("JWT VALID → Authentication SUCCESS");

            String email = jwtTokenProvider.getEmail(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            SecurityContextHolder.getContext().setAuthentication(
                    new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities()
                    )
            );
        } else {
            System.out.println("JWT INVALID OR NOT PROVIDED → Authentication SKIPPED");
        }

        System.out.println("→ JWT FILTER END\n");

        chain.doFilter(req, res);
    }
}
