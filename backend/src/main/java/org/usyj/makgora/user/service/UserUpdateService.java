package org.usyj.makgora.user.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.request.UserUpdateRequest;
import org.usyj.makgora.user.entity.UserEntity;
import org.usyj.makgora.user.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class UserUpdateService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserEntity getUserById(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    @Transactional
    public UserEntity updateUser(Integer id, UserUpdateRequest request, UserEntity currentUser) {
        UserEntity targetUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        if (targetUser.getRole() == UserEntity.Role.SUPER_ADMIN
                && currentUser.getRole() != UserEntity.Role.SUPER_ADMIN) {
            throw new RuntimeException("ADMIN은 SUPER_ADMIN 계정을 수정할 수 없습니다.");
        }

        if (request.getLoginId() != null) targetUser.setLoginId(request.getLoginId());
        if (request.getNickname() != null) targetUser.setNickname(request.getNickname());
        if (request.getLevel() != null) targetUser.setLevel(request.getLevel());
        if (request.getPoints() != null) targetUser.setPoints(request.getPoints());

        if (request.getAvatarIcon() != null) targetUser.setAvatarIcon(request.getAvatarIcon());
        if (request.getProfileFrame() != null) targetUser.setProfileFrame(request.getProfileFrame());
        if (request.getProfileBadge() != null) targetUser.setProfileBadge(request.getProfileBadge());

        if (request.getRole() != null) targetUser.setRole(request.getRole());
        if (request.getStatus() != null) targetUser.setStatus(request.getStatus());

        return targetUser;
    }
}
