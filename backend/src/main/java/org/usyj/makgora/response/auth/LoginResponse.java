package org.usyj.makgora.response.auth;

import lombok.*;
import org.usyj.makgora.entity.UserEntity;

@Getter
@Setter
@AllArgsConstructor
public class LoginResponse {
  private String accessToken;
  private String refreshToken;
  private UserEntity user;
}
