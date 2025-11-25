package org.usyj.makgora.request.auth;

import lombok.Data;

@Data
public class EmailVerifyRequest {
    private String email;
    private String code;
}
