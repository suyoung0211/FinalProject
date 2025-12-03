package org.usyj.makgora.profile.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.usyj.makgora.entity.UserEntity;
import org.usyj.makgora.profile.dto.RecentCommunityActivityResponse;
import org.usyj.makgora.profile.dto.RecentVoteActivityResponse;
import org.usyj.makgora.profile.service.ProfileActivityService;
import org.usyj.makgora.profile.service.ProfileService;
import org.usyj.makgora.request.ApplyItemRequest;
import org.usyj.makgora.security.CustomUserDetails;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileActivityService profileActivityService;
    private final ProfileService profileService;

    // ==========================================
    // 🔹 최근 활동 - 커뮤니티
    // ==========================================
    @GetMapping("/activities/community")
    public List<RecentCommunityActivityResponse> getRecentCommunityActivities(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam(defaultValue = "20") int limit
    ) {
        return profileActivityService.getRecentCommunityActivities(user.getId(), limit);
    }

    // ==========================================
    // 🔹 최근 활동 - 투표
    // ==========================================
    @GetMapping("/activities/votes")
    public List<RecentVoteActivityResponse> getRecentVoteActivities(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam(defaultValue = "20") int limit
    ) {
        return profileActivityService.getRecentVoteActivities(user.getId(), limit);
    }

    // ==========================================
    // 🔹 내 프로필 정보 조회 (사진/프레임/뱃지 포함)
    // ==========================================
    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(@AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(profileService.getMyProfile(user.getId()));
    }

    // ==========================================
    // 🔹 프로필 사진 업로드
    // ==========================================
    @PostMapping("/upload-photo")
    public ResponseEntity<?> uploadPhoto(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        String imageUrl = profileService.uploadProfileImage(user.getId(), file);
        return ResponseEntity.ok(imageUrl);
    }

    // ==========================================
    // 🔹 상점 아이템 적용 (프레임/뱃지)
    // ==========================================
    @PostMapping("/apply-item")
    public ResponseEntity<?> applyProfileItem(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody ApplyItemRequest req
    ) {
        String result = profileService.applyItem(user.getId(), req.getUserStoreId());
        return ResponseEntity.ok(result);
    }
}
