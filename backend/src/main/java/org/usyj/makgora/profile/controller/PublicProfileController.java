package org.usyj.makgora.profile.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.usyj.makgora.profile.dto.UserPublicProfileResponse;
import org.usyj.makgora.profile.service.PublicProfileService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class PublicProfileController {

    private final PublicProfileService userProfileService;

    /**
     * 🔹 유저 공개 프로필 조회
     * - 누구나 접근 가능
     * - 프로필 카드 / hover 카드용
     */
    @GetMapping("/{userId}/profile")
    public ResponseEntity<UserPublicProfileResponse> getUserProfile(
        @PathVariable Integer userId
    ) {
        return ResponseEntity.ok(
            userProfileService.getPublicProfile(userId)
        );
    }
}