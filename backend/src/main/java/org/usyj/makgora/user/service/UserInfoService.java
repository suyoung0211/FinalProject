package org.usyj.makgora.user.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.usyj.makgora.response.AdminUserInfoResponse;
import org.usyj.makgora.response.UserInfoResponse;
import org.usyj.makgora.store.entity.StoreItemEntity;
import org.usyj.makgora.store.entity.UserStoreEntity;
import org.usyj.makgora.store.repository.UserStoreRepository;
import org.usyj.makgora.user.entity.UserEntity;
import org.usyj.makgora.user.repository.UserRepository;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserInfoService {

    private final UserRepository repo;
    private final UserStoreRepository userStoreRepository;   // 🔥 추가됨

    // 🔹 일반 사용자용: 로그인한 사용자의 정보 조회
    public UserInfoResponse getMyInfoById(Integer userId) {

        UserEntity user = repo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // -----------------------------------------------------
        // 🔥 사용자가 실제 구매한 아이템 목록 조회
        // -----------------------------------------------------
        List<UserStoreEntity> purchasedItems = userStoreRepository.findByUserId(userId);

        Set<String> ownedFrames = purchasedItems.stream()
                .filter(us -> us.getItem().getCategory() == StoreItemEntity.Category.FRAME)
                .map(us -> us.getItem().getImage())
                .collect(Collectors.toSet());

        Set<String> ownedBadges = purchasedItems.stream()
                .filter(us -> us.getItem().getCategory() == StoreItemEntity.Category.BADGE)
                .map(us -> us.getItem().getImage())
                .collect(Collectors.toSet());

        boolean dirty = false;

        // 🔥 1) 프레임이 구매 목록에 없으면 제거
        if (user.getProfileFrame() != null &&
                !ownedFrames.contains(user.getProfileFrame())) {

            user.setProfileFrame(null);
            dirty = true;
        }

        // 🔥 2) 뱃지가 구매 목록에 없으면 제거
        if (user.getProfileBadge() != null &&
                !ownedBadges.contains(user.getProfileBadge())) {

            user.setProfileBadge(null);
            dirty = true;
        }

        // 🔥 3) 값이 변경되었다면 저장
        if (dirty) {
            repo.save(user);
        }

        // -----------------------------------------------------
        // 🔥 최종 유저 정보 반환
        // -----------------------------------------------------

        return UserInfoResponse.builder()
                .loginId(user.getLoginId())
                .nickname(user.getNickname())
                .level(user.getLevel())
                .points(user.getPoints())
                .avatarIcon(user.getAvatarIcon())
                .profileFrame(user.getProfileFrame())   // 정리된 값
                .profileBadge(user.getProfileBadge())   // 정리된 값
                .role(user.getRole().name())
                .build();
    }

    // 🔹 관리자용: 모든 사용자 정보 조회
    public List<AdminUserInfoResponse> getAllUsers(UserEntity currentUser) {
        return repo.findAll().stream()
                .filter(user -> filterDeletedAndSuperAdmin(user, currentUser))
                .map(this::toAdminDto)
                .collect(Collectors.toList());
    }

    // 🔹 관리자: nickname 포함 검색
    public List<AdminUserInfoResponse> searchUsersByNickname(String nickname, UserEntity currentUser) {
        return repo.findByNicknameContaining(nickname).stream()
                .filter(user -> filterDeletedAndSuperAdmin(user, currentUser))
                .map(this::toAdminDto)
                .collect(Collectors.toList());
    }

    // 🔹 관리자: 특정 사용자 조회
    public AdminUserInfoResponse getUserById(int id, UserEntity currentUser) {
        UserEntity user = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!filterDeletedAndSuperAdmin(user, currentUser)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

        return toAdminDto(user);
    }

    private boolean filterDeletedAndSuperAdmin(UserEntity user, UserEntity currentUser) {
        if (user.getStatus() == UserEntity.Status.DELETED &&
                currentUser.getRole() != UserEntity.Role.SUPER_ADMIN) {
            return false;
        }
        if (user.getRole() == UserEntity.Role.SUPER_ADMIN &&
                currentUser.getRole() != UserEntity.Role.SUPER_ADMIN) {
            return false;
        }
        return true;
    }

    private AdminUserInfoResponse toAdminDto(UserEntity user) {
        return new AdminUserInfoResponse(
                user.getId(),
                user.getLoginId(),
                user.getNickname(),
                user.getLevel(),
                user.getPoints(),
                user.getAvatarIcon(),
                user.getProfileFrame(),
                user.getProfileBadge(),
                user.getVerificationEmail(),
                user.getRole().name(),
                user.getStatus().name(),
                user.getCreatedAt().toString()
        );
    }
}
