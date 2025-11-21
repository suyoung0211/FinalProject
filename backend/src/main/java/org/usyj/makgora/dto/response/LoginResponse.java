package org.usyj.makgora.dto.response;

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
