package org.usyj.makgora.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserInfoResponse {
    private String nickname;
    private int level;
    private int points;
    private String profileImage;      // null 가능
    private String profileBackground; // null 가능
    private String role;
}