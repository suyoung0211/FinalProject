package org.usyj.makgora.auth.dto.request;

import lombok.Data;

@Data
public class RegisterRequest {
  private String loginId;
  private String password;
  private String nickname;
  private String verificationEmail;
}