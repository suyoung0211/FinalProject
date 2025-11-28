package org.usyj.makgora.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.usyj.makgora.response.AdminUserInfoResponse;
import org.usyj.makgora.service.UserInfoService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
public class AdminUserController {

    private final UserInfoService userInfoService;

    // 🔹 관리자: 모든 사용자 조회 (슈퍼어드민 제외)
    @GetMapping
    public ResponseEntity<List<AdminUserInfoResponse>> getAllUsers() {
        List<AdminUserInfoResponse> users = userInfoService.getAllUsers()
                .stream()
                .filter(u -> !"SUPER_ADMIN".equals(u.getRole())) // 슈퍼어드민 제외
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    // 🔹 관리자: loginId 포함 사용자 검색
    @GetMapping("/search")
    public ResponseEntity<List<AdminUserInfoResponse>> searchUsers(@RequestParam String loginId) {
        List<AdminUserInfoResponse> users = userInfoService.searchUsersByLoginId(loginId)
                .stream()
                .filter(u -> !"SUPER_ADMIN".equals(u.getRole())) // 슈퍼어드민 제외
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    // 🔹 관리자: 특정 사용자 상세 조회
    @GetMapping("/{loginId}")
    public ResponseEntity<AdminUserInfoResponse> getUserByLoginId(@PathVariable String loginId) {
        AdminUserInfoResponse user = userInfoService.getUserByLoginId(loginId);

        if ("SUPER_ADMIN".equals(user.getRole())) {
            // 슈퍼어드민 조회 금지
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(user);
    }
}