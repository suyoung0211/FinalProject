package org.usyj.makgora.request;

import lombok.Data;

@Data
public class LoginRequest {
  private String loginId;
  private String password;
}
