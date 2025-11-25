package org.usyj.makgora.response.auth;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EmailVerifyResponse {
    private boolean success;
    private String message;

    public static EmailVerifyResponse ok(String msg) {
        return EmailVerifyResponse.builder().success(true).message(msg).build();
    }

    public static EmailVerifyResponse fail(String msg) {
        return EmailVerifyResponse.builder().success(false).message(msg).build();
    }
}
