package org.usyj.makgora.service;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class EmailVerificationStore {

    @Data
    @AllArgsConstructor
    public static class VerificationData {
        private String code;
        private LocalDateTime expiresAt;
    }

    // 이메일 → 코드 정보 저장
    private final ConcurrentHashMap<String, VerificationData> store = new ConcurrentHashMap<>();

    public void save(String email, String code, LocalDateTime expiresAt) {
        store.put(email, new VerificationData(code, expiresAt));
    }

    public VerificationData get(String email) {
        return store.get(email);
    }

    public void remove(String email) {
        store.remove(email);
    }
}
