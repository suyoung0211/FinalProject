package org.usyj.makgora.request;

import lombok.Data;

@Data
    public class CreateAdminRequest {
        private String loginId;
        private String nickname;
        private String password;
        private String verificationEmail;
    }
