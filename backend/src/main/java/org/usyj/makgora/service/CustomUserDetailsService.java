package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import org.usyj.makgora.global.security.CustomUserDetails;
import org.usyj.makgora.user.entity.UserEntity;
import org.usyj.makgora.user.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository repo;

    // -----------------------------
    // 기존 로그인 ID 기반 조회
    // -----------------------------
    @Override
    public UserDetails loadUserByUsername(String loginId) throws UsernameNotFoundException {
        UserEntity user = repo.findByLoginId(loginId)
                .orElseThrow(() -> new UsernameNotFoundException("사용자 없음: " + loginId));

        return new CustomUserDetails(user);
    }

    // -----------------------------
    // 유저 ID 기반 조회
    // -----------------------------
    public UserDetails loadUserById(Integer userId) throws UsernameNotFoundException {
        UserEntity user = repo.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("사용자 없음 ID: " + userId));

        return new CustomUserDetails(user);
    }
}