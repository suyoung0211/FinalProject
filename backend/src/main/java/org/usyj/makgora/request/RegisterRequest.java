package org.usyj.makgora.request;

import lombok.Data;

@Data
public class RegisterRequest {
  private String loginId;
  private String password;
  private String nickname;
  private String verificationEmail;
}