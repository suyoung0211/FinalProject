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
                // (method.equals("GET") && path.startsWith("/api/articles")) ||
                (method.equals("GET") && path.startsWith("/api/categories")) ||
                (method.equals("GET") && path.startsWith("/api/issues")) ||
                (method.equals("GET") &&
                        (path.equals("/api/votes")
                                || path.equals("/api/votes/")
                                || (path.startsWith("/api/votes/") && !path.startsWith("/api/votes/my"))
                        )
                ) ||
                (method.equals("GET") && path.startsWith("/api/community/posts"))||
                (method.equals("POST") && path.equals("/api/votes/ai-create"))||
                (method.equals("GET") && path.matches("^/api/normal-votes(/.*)?$") && !path.matches("^.*/participate$"));

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
        // 🔹 요청 헤더에 JWT가 존재할 경우에만 인증 처리 진행
        if (token != null) {
            try {
                // 🔒 토큰 유효성 검증 (만료 여부 / 서명 위조 여부 확인)
                if (!jwtTokenProvider.validateToken(token)) {
                    // → 검증 실패 시 예외 발생시켜 catch로 이동
                    throw new RuntimeException("Invalid Token");
                }

                // 🔹 토큰이 유효하면 토큰에서 userId 추출
                Integer userId = jwtTokenProvider.getUserId(token);

                // 🔹 DB에서 사용자 정보 조회 (권한 정보 포함)
                //    — SecurityContext에 저장할 UserDetails 생성 목적
                UserDetails userDetails = userDetailsService.loadUserById(userId);

                // 🔹 인증 객체 생성
                //    principal: 인증된 사용자 정보
                //    credentials: 패스워드(토큰 인증이므로 null)
                //    authorities: 역할(Role)
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities()
                        );

                // 🔹 스프링 시큐리티 SecurityContext에 인증 정보 저장
                //    → 이후 컨트롤러에서 @AuthenticationPrincipal 로 접근 가능
                SecurityContextHolder.getContext().setAuthentication(authentication);

            } catch (Exception e) {
                // ❌ 토큰 만료 또는 위조/파싱 실패 시 요청 즉시 차단
                res.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401 반환
                res.getWriter().write("JWT Expired or Invalid");    // 에러 응답 메시지
                return; // 🔥 요청 흐름 중지 (아래 필터 체인으로 넘어가지 않음)
            }
        }

        // ⭕ 토큰이 없거나 정상일 경우 다음 필터로 요청 계속 진행
        chain.doFilter(req, res);
    }
}