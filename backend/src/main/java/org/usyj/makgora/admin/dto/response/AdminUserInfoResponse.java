package org.usyj.makgora.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminUserInfoResponse {
    private Integer id;
    private String loginId;
    private String nickname;
    private Integer level;
    private Integer points;

    private String avatarIcon;     // 변경
    private String profileFrame;   // 변경
    private String profileBadge;   // 변경

    private String verificationEmail;
    private String role;
    private String status;
    private String createdAt;
}
