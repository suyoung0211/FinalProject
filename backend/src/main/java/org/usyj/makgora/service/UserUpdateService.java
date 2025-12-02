package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.UserEntity;
import org.usyj.makgora.repository.UserRepository;
import org.usyj.makgora.request.UserUpdateRequest;

@Service
@RequiredArgsConstructor
public class UserUpdateService {

    private final UserRepository userRepository;

    // 🔹 특정 사용자 조회 (컨트롤러에서 SUPER_ADMIN 보호용)
    @Transactional(readOnly = true)
    public UserEntity getUserById(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    // 🔹 사용자 정보 수정
    @Transactional
    public UserEntity updateUser(Integer id, UserUpdateRequest request, UserEntity currentUser) {
        UserEntity targetUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // SUPER_ADMIN 보호
        if (targetUser.getRole() == UserEntity.Role.SUPER_ADMIN
                && currentUser.getRole() != UserEntity.Role.SUPER_ADMIN) {
            throw new RuntimeException("ADMIN은 SUPER_ADMIN 계정을 수정할 수 없습니다.");
        }

        // 선택적 필드 업데이트
        if (request.getLoginId() != null) targetUser.setLoginId(request.getLoginId());
        if (request.getNickname() != null) targetUser.setNickname(request.getNickname());
        if (request.getLevel() != null) targetUser.setLevel(request.getLevel());
        if (request.getPoints() != null) targetUser.setPoints(request.getPoints());
        if (request.getProfileBackground() != null) targetUser.setProfileBackground(request.getProfileBackground());
        if (request.getProfileImage() != null) targetUser.setProfileImage(request.getProfileImage());
        if (request.getRole() != null) targetUser.setRole(request.getRole());
        if (request.getStatus() != null) targetUser.setStatus(request.getStatus());

        return targetUser; // @Transactional 안에서 변경된 엔티티가 DB에 반영됨
    }
}
