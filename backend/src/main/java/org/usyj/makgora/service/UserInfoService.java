package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.usyj.makgora.entity.UserEntity;
import org.usyj.makgora.repository.UserRepository;
import org.usyj.makgora.response.AdminUserInfoResponse;
import org.usyj.makgora.response.UserInfoResponse;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserInfoService {

    private final UserRepository repo;

    // 🔹 일반 사용자용: 로그인한 사용자의 정보 조회
    public UserInfoResponse getMyInfo(String loginId) {
        UserEntity user = repo.findByLoginId(loginId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return new UserInfoResponse(
                user.getNickname(),
                user.getLevel(),
                user.getPoints(),
                user.getProfileImage(),
                user.getProfileBackground(),
                user.getRole().name()
        );
    }

    // 🔹 관리자용: 모든 사용자 정보 조회
    public List<AdminUserInfoResponse> getAllUsers(UserEntity currentUser) {
        return repo.findAll().stream()
                .filter(user -> filterDeletedAndSuperAdmin(user, currentUser))
                .map(this::toAdminDto)
                .collect(Collectors.toList());
    }

    // 🔹 관리자: nickname 포함 사용자 검색
    public List<AdminUserInfoResponse> searchUsersByNickname(String nickname, UserEntity currentUser) {
        return repo.findByNicknameContaining(nickname).stream()
                .filter(user -> filterDeletedAndSuperAdmin(user, currentUser))
                .map(this::toAdminDto)
                .collect(Collectors.toList());
    }

    // 🔹 관리자: 특정 사용자 단일 조회
    public AdminUserInfoResponse getUserById(int id, UserEntity currentUser) {
        UserEntity user = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!filterDeletedAndSuperAdmin(user, currentUser)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

        return toAdminDto(user);
    }

    // 🔹 DELETED/슈퍼어드민 필터링 헬퍼
    private boolean filterDeletedAndSuperAdmin(UserEntity user, UserEntity currentUser) {
        // DELETED 상태는 슈퍼어드민만 조회 가능
        if (user.getStatus() == UserEntity.Status.DELETED && currentUser.getRole() != UserEntity.Role.SUPER_ADMIN) {
            return false;
        }
        // 슈퍼어드민은 일반 어드민이 조회 불가
        if (user.getRole() == UserEntity.Role.SUPER_ADMIN && currentUser.getRole() != UserEntity.Role.SUPER_ADMIN) {
            return false;
        }
        return true;
    }

    // 🔹 DTO 변환 helper
    private AdminUserInfoResponse toAdminDto(UserEntity user) {
        return new AdminUserInfoResponse(
                user.getId(),
                user.getLoginId(),
                user.getNickname(),
                user.getLevel(),
                user.getPoints(),
                user.getProfileImage(),
                user.getProfileBackground(),
                user.getVerificationEmail(),
                user.getRole().name(),
                user.getStatus().name(),
                user.getCreatedAt().toString()
        );
    }
}
