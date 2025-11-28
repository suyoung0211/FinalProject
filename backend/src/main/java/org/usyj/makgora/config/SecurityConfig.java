package org.usyj.makgora.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.http.HttpMethod;
import org.springframework.scheduling.annotation.EnableAsync;
import org.usyj.makgora.security.JwtTokenProvider;
import org.usyj.makgora.service.CustomUserDetailsService;

@EnableAsync
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .formLogin(login -> login.disable())
            .httpBasic(basic -> basic.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .authorizeHttpRequests(auth -> auth
                // ⭐ Preflight 허용
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // ⭐ 비인가 허용되는 엔드포인트
                .requestMatchers(
                        "/api/auth/login",
                        "/api/auth/register",
                        "/api/auth/refresh",
                        "/api/email/**",
                        "/api/home/**"
                ).permitAll()

                // 🔥 투표 조회(GET) 허용 (프론트에서 VotePage 불러올 수 있도록)
                .requestMatchers(HttpMethod.GET, "/api/votes/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/vote/**").permitAll()

                // ⭐ 커뮤니티: 조회는 모두 허용, 작성/수정/삭제는 인증 필요
                .requestMatchers(HttpMethod.GET, "/api/community/posts/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/community/posts/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/community/posts/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/community/posts/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/community/posts/*/reactions").authenticated()

                // ⭐ 로그아웃은 반드시 인증 필요
                .requestMatchers(HttpMethod.POST, "/api/auth/logout/**").authenticated()

                // ⭐ 보호 API
                .requestMatchers("/api/user/**").authenticated()
                .requestMatchers("/api/vote/**").authenticated()
                .requestMatchers("/api/issues/articles/**").authenticated()
                .requestMatchers("/api/comment/**").authenticated()
                

                .anyRequest().authenticated()
            )
            .logout(logout -> logout.disable())

            // JWT 필터 삽입
            .addFilterBefore(
                new JwtAuthFilter(jwtTokenProvider, userDetailsService),
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOriginPattern("*");
        config.setAllowCredentials(true);
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
