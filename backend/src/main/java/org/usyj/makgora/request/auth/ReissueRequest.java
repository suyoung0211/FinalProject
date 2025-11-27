package org.usyj.makgora.request.auth;

import lombok.Data;

@Data
public class ReissueRequest {
  private String refreshToken;
}