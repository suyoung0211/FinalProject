package org.usyj.makgora.profile.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.http.HttpStatus;
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
import org.usyj.makgora.request.UserUpdateRequest;
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
        @RequestParam("file") MultipartFile file,
        @AuthenticationPrincipal CustomUserDetails user
) {
    try {
        String savedUrl = profileService.uploadProfileImage(user.getId(), file);
        return ResponseEntity.ok(savedUrl);

    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(500).body("업로드 실패: " + e.getMessage());
    }
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

    @GetMapping("/my-items")
    public ResponseEntity<?> getMyItems(@AuthenticationPrincipal CustomUserDetails user) {
    return ResponseEntity.ok(profileService.getMyItems(user.getId()));
}
    @PostMapping("/clear-frame")
    public ResponseEntity<?> clearFrame(@AuthenticationPrincipal CustomUserDetails user) {
        profileService.clearFrame(user.getId());
        return ResponseEntity.ok("프레임 해제 완료");
    }

    @PostMapping("/clear-badge")
    public ResponseEntity<?> clearBadge(@AuthenticationPrincipal CustomUserDetails user) {
        profileService.clearBadge(user.getId());
        return ResponseEntity.ok("뱃지 해제 완료");
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody UserUpdateRequest req
    ) {
        profileService.updateProfile(user.getId(), req);
        return ResponseEntity.ok("프로필 수정 완료");
    }
}
