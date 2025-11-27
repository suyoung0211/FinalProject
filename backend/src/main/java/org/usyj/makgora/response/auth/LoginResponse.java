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

  // Access Token만 전달용 생성자
  public LoginResponse(String accessToken) {
      this.accessToken = accessToken;
  }
}
