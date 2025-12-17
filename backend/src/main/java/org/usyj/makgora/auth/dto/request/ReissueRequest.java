package org.usyj.makgora.auth.dto.request;

import lombok.Data;

@Data
public class ReissueRequest {
  private String refreshToken;
}