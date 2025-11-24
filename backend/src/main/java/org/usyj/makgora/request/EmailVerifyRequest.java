package org.usyj.makgora.request;

import lombok.Data;

@Data
public class EmailVerifyRequest {
    private String email;
    private String code;
}
