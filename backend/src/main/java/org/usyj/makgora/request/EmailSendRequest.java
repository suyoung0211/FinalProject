package org.usyj.makgora.request;

import lombok.Data;

@Data
public class EmailSendRequest {
    private String email; // 인증메일을 보낼 이메일
}