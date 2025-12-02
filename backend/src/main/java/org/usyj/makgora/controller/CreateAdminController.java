package org.usyj.makgora.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.usyj.makgora.entity.UserEntity;
import org.usyj.makgora.request.CreateAdminRequest;
import org.usyj.makgora.security.CustomUserDetails;
import org.usyj.makgora.service.CreateAdminService;
import org.springframework.security.core.Authentication;


import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/create")
@RequiredArgsConstructor
public class CreateAdminController {

    private final CreateAdminService createAdminService;

    // 🔹 SecurityContext에서 현재 로그인한 유저 정보 가져오기(역할 확인용)
    private UserEntity getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof CustomUserDetails customUser) {
            return customUser.getUser();
        }

        throw new IllegalStateException("로그인된 유저 정보가 올바르지 않습니다.");
    }

    /**
     * 슈퍼어드민 전용 관리자 추가
     */
    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<UserEntity> createAdmin(@RequestBody CreateAdminRequest request) {

        // 1. 현재 로그인한 SUPER_ADMIN 정보 가져오기
        UserEntity currentUser = getCurrentUser();

        // 2. 새 ADMIN 생성
        UserEntity newAdmin = createAdminService.createAdmin(
                request.getLoginId(),
                request.getNickname(),
                request.getPassword(),
                request.getVerificationEmail()
        );

        // 3. SecurityContext 갱신 (권한 유지)
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        List<GrantedAuthority> updatedAuthorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + currentUser.getRole().name())
        );
        Authentication newAuth = new UsernamePasswordAuthenticationToken(
                currentUser,
                auth.getCredentials(),
                updatedAuthorities
        );
        SecurityContextHolder.getContext().setAuthentication(newAuth);

        return ResponseEntity.ok(newAdmin);
    }
}