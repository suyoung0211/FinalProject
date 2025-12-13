package org.usyj.makgora.profile.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 🔹 공개 프로필 응답 DTO
 * - 어디서든 유저 프로필 카드에서 사용
 * - 민감 정보 절대 포함 금지
 */
@Getter
@AllArgsConstructor
public class UserPublicProfileResponse {

    // 🔹 프론트에서 다시 요청하거나 식별할 수 있도록 포함
    private Integer userId;

    // 🔹 기본 표시 정보
    private String nickname;
    private Integer level;
    private Integer points;

    // 🔹 커스터마이징 요소
    private String avatarIcon;
    private String profileFrame;
    private String profileBadge;
}