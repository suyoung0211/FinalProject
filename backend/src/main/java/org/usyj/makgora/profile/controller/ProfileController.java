package org.usyj.makgora.profile.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.usyj.makgora.profile.dto.RecentCommunityActivityResponse;
import org.usyj.makgora.profile.dto.RecentVoteActivityResponse;
import org.usyj.makgora.profile.service.ProfileActivityService;
import org.usyj.makgora.security.CustomUserDetails;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileActivityService profileActivityService;

    // 프로필 > 최근 활동(커뮤니티)
    @GetMapping("/activities/community")
    public List<RecentCommunityActivityResponse> getRecentCommunityActivities(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam(defaultValue = "20") int limit
    ) {
        return profileActivityService.getRecentCommunityActivities(user.getId(), limit);
    }

    /**
     * 프로필 > 최근 활동(투표)
     * - Vote_Users 기준으로 내가 베팅한 투표 내역을 최신순으로 반환
     */
    @GetMapping("/activities/votes")
    public List<RecentVoteActivityResponse> getRecentVoteActivities(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam(defaultValue = "20") int limit
    ) {
        return profileActivityService.getRecentVoteActivities(user.getId(), limit);
    }
}
