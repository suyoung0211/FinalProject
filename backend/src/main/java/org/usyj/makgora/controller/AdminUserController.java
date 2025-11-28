package org.usyj.makgora.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.response.AdminUserInfoResponse;
import org.usyj.makgora.service.UserInfoService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')") // 전체 컨트롤러 단위로 ADMIN 권한 체크
public class AdminUserController {

    private final UserInfoService userInfoService;

    // 🔹 관리자: 모든 사용자 조회
    @GetMapping
    public ResponseEntity<List<AdminUserInfoResponse>> getAllUsers() {
        List<AdminUserInfoResponse> users = userInfoService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    // 🔹 관리자: loginId 포함 사용자 검색
    @GetMapping("/search")
    public ResponseEntity<List<AdminUserInfoResponse>> searchUsers(@RequestParam String loginId) {
        List<AdminUserInfoResponse> users = userInfoService.searchUsersByLoginId(loginId);
        return ResponseEntity.ok(users);
    }

    // 🔹 관리자: 특정 사용자 상세 조회 (옵션)
    @GetMapping("/{loginId}")
    public ResponseEntity<AdminUserInfoResponse> getUserByLoginId(@PathVariable String loginId) {
        AdminUserInfoResponse user = userInfoService.getUserByLoginId(loginId);
        return ResponseEntity.ok(user);
    }
}