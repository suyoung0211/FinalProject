package org.usyj.makgora.profile.service;

import org.springframework.stereotype.Service;
import org.usyj.makgora.entity.UserEntity;
import org.usyj.makgora.profile.dto.UserPublicProfileResponse;
import org.usyj.makgora.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PublicProfileService {

    private final UserRepository userRepository;

    
    /**
     * 🔹 공개 프로필 조회
     * - userId 기준
     * - ADMIN / SUPER_ADMIN은 상태 상관없이 조회 가능
     * - 일반 USER는 ACTIVE 상태만 조회
     */
    public UserPublicProfileResponse getPublicProfile(Integer userId) {

        // 🔹 유저 조회 (ID만 기준)
        UserEntity user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));

        // 🔹 Entity → DTO 변환
        return new UserPublicProfileResponse(
            user.getId(),
            user.getNickname(),
            user.getLevel(),
            user.getPoints(),
            user.getAvatarIcon(),
            user.getProfileFrame(),
            user.getProfileBadge()
        );
    }
}