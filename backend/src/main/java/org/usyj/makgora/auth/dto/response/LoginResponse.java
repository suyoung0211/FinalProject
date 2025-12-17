package org.usyj.makgora.auth.dto.response;

import org.usyj.makgora.response.UserInfoResponse;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class LoginResponse {
  private String accessToken;
  private String refreshToken;
  private UserInfoResponse user;  // UserEntity -> UserInfoResponse

  // Access Token만 전달용 생성자
  public LoginResponse(String accessToken) {
      this.accessToken = accessToken;
  }
}
