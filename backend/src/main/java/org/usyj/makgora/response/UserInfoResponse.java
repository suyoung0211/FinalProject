package org.usyj.makgora.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder  // ← 이것 추가!
public class UserInfoResponse {
    private String loginId;
    private String nickname;
    private Integer level;
    private Integer points;
    private String avatarIcon;
    private String profileFrame;
    private String profileBadge;
    private String role;
}