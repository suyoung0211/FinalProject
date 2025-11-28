package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.usyj.makgora.response.AdminUserInfoResponse;
import org.usyj.makgora.response.UserInfoResponse;
import org.usyj.makgora.entity.UserEntity;
import org.usyj.makgora.repository.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserInfoService {

    private final UserRepository repo;

    // 🔹 일반 사용자용: 로그인한 사용자의 정보 조회
    public UserInfoResponse getMyInfo(String loginId) {
        UserEntity user = repo.findByLoginId(loginId)
                .orElseThrow(() -> new RuntimeException("User not found"));

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
    public List<AdminUserInfoResponse> getAllUsers() {
        List<UserEntity> users = repo.findAll();

        return users.stream()
                .map(user -> new AdminUserInfoResponse(
                        user.getLoginId(),
                        user.getNickname(),
                        user.getLevel(),
                        user.getPoints(),
                        user.getProfileImage(),
                        user.getProfileBackground(),
                        user.getRole().name(),
                        user.getStatus().name(),
                        user.getCreatedAt().toString()
                ))
                .collect(Collectors.toList());
    }

    // 🔹 관리자: loginId 포함 사용자 검색
    public List<AdminUserInfoResponse> searchUsersByLoginId(String loginIdPart) {
        return repo.findByLoginIdContaining(loginIdPart).stream()
                .map(user -> new AdminUserInfoResponse(
                        user.getLoginId(),
                        user.getNickname(),
                        user.getLevel(),
                        user.getPoints(),
                        user.getProfileImage(),
                        user.getProfileBackground(),
                        user.getRole().name(),
                        user.getStatus().name(),
                        user.getCreatedAt().toString()
                ))
                .collect(Collectors.toList());
        }
}
