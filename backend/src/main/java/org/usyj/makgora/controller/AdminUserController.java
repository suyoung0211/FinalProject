package org.usyj.makgora.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.usyj.makgora.entity.UserEntity;
import org.usyj.makgora.request.UserUpdateRequest;
import org.usyj.makgora.response.AdminUserInfoResponse;
import org.usyj.makgora.security.CustomUserDetails;
import org.usyj.makgora.service.UserInfoService;
import org.usyj.makgora.service.UserUpdateService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
public class AdminUserController {

    private final UserInfoService userInfoService;
    private final UserUpdateService userUpdateService;

    // 🔹 SecurityContext에서 현재 로그인한 유저 정보 가져오기(역할 확인용)
    private UserEntity getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof CustomUserDetails customUser) {
            return customUser.getUser();
        }

        throw new IllegalStateException("로그인된 유저 정보가 올바르지 않습니다.");
    }

    // 🔹 관리자: 모든 사용자 조회
    @GetMapping
    public ResponseEntity<List<AdminUserInfoResponse>> getAllUsers() {
        UserEntity currentUser = getCurrentUser();

        List<AdminUserInfoResponse> users = userInfoService.getAllUsers(currentUser)
                .stream()
                .collect(Collectors.toList());

        return ResponseEntity.ok(users);
    }

    // 🔹 관리자: nickname 포함 사용자 검색
    @GetMapping("/search")
    public ResponseEntity<List<AdminUserInfoResponse>> searchUsers(@RequestParam String nickname) {
        UserEntity currentUser = getCurrentUser();

        List<AdminUserInfoResponse> users = userInfoService.searchUsersByNickname(nickname, currentUser)
                .stream()
                .collect(Collectors.toList());

        return ResponseEntity.ok(users);
    }

    // 🔹 관리자: 특정 사용자 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<AdminUserInfoResponse> getUserById(@PathVariable int id) {
        UserEntity currentUser = getCurrentUser();

        AdminUserInfoResponse user = userInfoService.getUserById(id, currentUser);

        return ResponseEntity.ok(user);
    }

    // 🔹 관리자: 특정 사용자 수정
    @PutMapping("/{id}")
    public ResponseEntity<UserEntity> updateUser(
            @PathVariable Integer id,
            @RequestBody UserUpdateRequest request
    ) {
        UserEntity currentUser = getCurrentUser();
        UserEntity targetUser = userUpdateService.getUserById(id); // target user 조회

        // SUPER_ADMIN 보호
        if (targetUser.getRole() == UserEntity.Role.SUPER_ADMIN
                && currentUser.getRole() != UserEntity.Role.SUPER_ADMIN) {
            throw new RuntimeException("ADMIN은 SUPER_ADMIN 계정을 수정할 수 없습니다.");
        }

        // 수정 호출 시 currentUser 전달
        UserEntity updatedUser = userUpdateService.updateUser(id, request, currentUser);

        return ResponseEntity.ok(updatedUser);
    }
}
