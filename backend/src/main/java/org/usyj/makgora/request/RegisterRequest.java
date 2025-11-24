package org.usyj.makgora.request;

import lombok.Data;

@Data
public class RegisterRequest {
  private String email;
  private String password;
  private String nickname;
}