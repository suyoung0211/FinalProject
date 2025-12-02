package org.usyj.makgora.request;

import org.usyj.makgora.entity.UserEntity;

import lombok.Data;

@Data
public class UserUpdateRequest {
    private String loginId;
    private String nickname;
    private Integer level;
    private Integer points;
    private String profileBackground;
    private String profileImage;
    private UserEntity.Role role;
    private UserEntity.Status status;
}