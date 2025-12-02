package org.usyj.makgora.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminUserInfoResponse {
    private int id;
    private String loginId;
    private String nickname;
    private int level;
    private int points;
    private String profileImage;       // null 가능
    private String profileBackground;  // null 가능
    private String verificationEmail;
    private String role;
    private String status;
    private String createdAt;          // 문자열로 반환
}